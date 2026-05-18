"use server"

import { db } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server"
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendInvitation = async (emails, workSpId) => {
    try {
        if (emails.length === 0 || !workSpId) throw new Error("Required");

        const user = await currentUser();
        if (!user) throw new Error("Unauthorized");

        const dbUser = await db.user.findUnique({ where: { clerkUserId: user.id } });
        if (!dbUser) throw new Error("User not found");

        const workspace = await db.workspace.findUnique({ where: { id: workSpId } });
        if (!workspace) throw new Error("WorkSpace does not exist!");
        if (dbUser.id !== workspace.adminId) throw new Error("NOT ALLOWED");

        // Create invitation rows in DB + send emails in parallel
        const results = await Promise.allSettled(
            emails.map(async (email) => {
                // Check if already a member
                const alreadyMember = await db.workspaceMember.findFirst({
                    where: {
                        workspaceId: workSpId,
                        user: { email },
                    }
                });
                if (alreadyMember) throw new Error(`${email} is already a member`);

                // Upsert invitation — if they were previously rejected/expired, re-invite them
                const invitation = await db.workspaceInvitation.upsert({
                    where: { workspaceId_email: { workspaceId: workSpId, email } },
                    update: {
                        status: "PENDING",
                        token: crypto.randomUUID(),
                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        updatedAt: new Date(),
                    },
                    create: {
                        token: crypto.randomUUID(),
                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        workspaceId: workSpId,
                        invitedById: dbUser.id,
                        email,
                        status: "PENDING",
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                });

                const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${invitation.token}`;

                // Send email
                await transporter.sendMail({
                    from: `"${dbUser.name} via Prept" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: `You're invited to join "${workspace.name}" on Prept`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f0f11; color: #e8eaf0; border-radius: 12px;">
                            <h2 style="color: #d4a843; margin-bottom: 8px;">You're invited!</h2>
                            <p style="color: #8a9ab8; margin-bottom: 24px;">
                                <strong style="color: #e8eaf0;">${dbUser.name}</strong> has invited you to join the workspace 
                                <strong style="color: #e8eaf0;">${workspace.name}</strong> on Prept.
                            </p>
                            <a href="${inviteLink}" 
                               style="display: inline-block; background: linear-gradient(135deg, #c9962a, #e8bf55); color: #1a1000; font-weight: 600; padding: 12px 28px; border-radius: 8px; text-decoration: none;">
                                Accept Invitation
                            </a>
                            <a href="${inviteLink}" 
                               style="display: inline-block; background: linear-gradient(135deg, #c9962a, #e8bf55); color: #1a1000; font-weight: 600; padding: 12px 28px; border-radius: 8px; text-decoration: none;">
                                Reject Invitation
                            </a>
                            <p style="color: #5a7090; font-size: 12px; margin-top: 24px;">
                                This invitation expires in 7 days. If you didn't expect this, you can ignore this email.
                            </p>
                        </div>
                    `,
                });

                return { email, success: true };
            })
        );

        // Separate successes from failures and report back
        const succeeded = results
            .filter(r => r.status === "fulfilled")
            .map(r => r.value.email);

        const failed = results
            .filter(r => r.status === "rejected")
            .map(r => r.reason?.message ?? "Unknown error");

        return { succeeded, failed };

    } catch (error) {
        console.error("Invitation error:", error);
        throw new Error(error.message || "Failed to send invitations");
    }
}

export const handleInvitation = async (token, action = "REJECTED") => {
    try {
        if (!token) throw new Error("Invalid invitation");
        const invitation = await db.workspaceInvitation.findUnique({ where: { token } });
        if (!invitation) throw new Error("Invitation not found");
        if (invitation.status !== "PENDING") throw new Error("Invitation is not pending");
        if (invitation.expiresAt < new Date()) throw new Error("Invitation has expired");
        if (action === "REJECTED") {
            await db.workspaceInvitation.update({ where: { token }, data: { status: "REJECTED", updatedAt: new Date() } });
            return { success: true };
        }

        if (action === "ACCEPTED") {
            const user = await currentUser();
            if (!user) throw new Error("You must be logged in to accept an invitation");
            const dbUser = await db.user.findUnique({ where: { clerkUserId: user.id } });
            if (!dbUser) throw new Error("User profile not found");

            if (dbUser.email !== invitation.email) throw new Error("Email does not match");

            const workspaceMembers = await db.workspaceMember.findFirst({
                where: {
                    workspaceId: invitation.workspaceId,
                    userId: dbUser.id
                }
            });

            if (workspaceMembers) throw new Error("You are already a member of this workspace");

            await db.$transaction(async (tx) => {
                // Mark invitation as accepted
                await tx.workspaceInvitation.update({
                    where: { token },
                    data: { status: "ACCEPTED", updatedAt: new Date() }
                });
                // Add user to the workspace
                await tx.workspaceMember.create({
                    data: {
                        workspaceId: invitation.workspaceId,
                        userId: dbUser.id,
                        role: "MEMBER",
                        joinedAt: new Date(),

                    }
                });
            });
        }

        return {
            success: true,
        };
    } catch (error) {
        console.error("Invitation error:", error);
        throw new Error(error.message || "Failed to process invitation");
    }
}