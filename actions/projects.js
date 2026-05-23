"use server"

import { db } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export const getWorkSpaceProjects = async (wrkSpId) => {
    try {
        const user = await currentUser();
        if (!user) throw new Error("Unauthorized");

        const dbUser = await db.user.findUnique({
            where: { clerkUserId: user.id },
        });

        if (!dbUser) throw new Error("User not found");

        const workspace = await db.workspace.findUnique({
            where: { id: wrkSpId },
        })

        if (!workspace) throw new Error("Workspace not found!");

        const projects = await db.project.findMany({
            where: { workspaceId: wrkSpId },
            include: {
                createdBy: {
                    select: {
                        name: true,
                        imageUrl: true,
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return projects;
    } catch (error) {
        console.error("Project fetching failure:", error);
        throw new Error("Project fetching failed.");
    }
}

export const createNewProject = async (data) => {
    try {
        const user = await currentUser();
        if (!user) throw new Error("Unauthorized");

        const dbUser = await db.user.findUnique({
            where: { clerkUserId: user.id },
        });

        if (!dbUser) throw new Error("User not found");

        const workspace = await db.workspace.findUnique({
            where: { id: data.workspaceId },
        });

        if (!workspace) throw new Error("Workspace not found!");

        console.log(workspace.adminId !== dbUser.id);
        
        if (workspace.adminId !== dbUser.id) throw new Error("Access Denied!");


        const project = await db.$transaction(async (tx) => {
            await tx.project.create({
                data: {
                    title: data.title,
                    description: data.description,
                    workspaceId: data.workspaceId,
                    category: data.category,
                    startTime: data.startTime,
                    endTime: data.endTime,
                    status: data.startTime > new Date() ? "TOBESTART" : "INPROCESS",
                    createdById: dbUser.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });

            await tx.workspace.update({
                where: { id: data.workspaceId },
                data: { noOfFreeProjects: { increment: 1 } },
            });
        });

        return {
            success: true
        };
    } catch (error) {
        console.error("Project creation failure:", error);
        throw new Error("Project creation failed.", error.message);
    }
}

export const deleteProject = async (projectId) => {
    try {
        const user = await currentUser();
        if (!user) throw new Error("Unauthorized");

        const dbUser = await db.user.findUnique({
            where: { clerkUserId: user.id },
        });

        if (!dbUser) throw new Error("User not found");

        const project = await db.project.findUnique({
            where: { id: projectId },
            include: { workspace: true }
        });

        if (!project) throw new Error("Project not found!");

        if (project.workspace.adminId !== dbUser.id) {
            throw new Error("Only the workspace admin can delete projects.");
        }

        await db.$transaction(async (tx) => {
            // Delete all tasks related to project
            await tx.task.deleteMany({
                where: { projectId: projectId }
            });

            // Delete project
            await tx.project.delete({
                where: { id: projectId }
            });

            // Decrease the noOfFreeProjects in workspace table by 1
            await tx.workspace.update({
                where: { id: project.workspaceId },
                data: { noOfFreeProjects: { decrement: 1 } }
            });
        });

        return { success: true };
    } catch (error) {
        console.error("Project deletion failure:", error);
        throw new Error(error.message || "Project deletion failed.");
    }
}

export const getProjectById = async (projectId) => {
    try {
        const user = await currentUser();
        if (!user) throw new Error("Unauthorized");

        const dbUser = await db.user.findUnique({
            where: { clerkUserId: user.id },
        });

        if (!dbUser) throw new Error("User not found");

        const project = await db.project.findUnique({
            where: { id: projectId },
            include: {
                workspace: {
                    include: {
                        members: {
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                        email: true,
                                        imageUrl: true,
                                    }
                                }
                            }
                        }
                    }
                },
                createdBy: {
                    select: {
                        name: true,
                        imageUrl: true,
                    }
                }
            }
        });

        if (!project) throw new Error("Project not found!");

        const isMember = project.workspace.members.some(member => member.userId === dbUser.id);
        if (!isMember) throw new Error("You are not a member of this workspace!");

        return project;
    } catch (error) {
        console.error("Project fetching failure:", error);
        throw new Error("Project fetching failed.");
    }
}
