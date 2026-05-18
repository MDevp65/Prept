import { GoldTitle } from "@/components/custom/reusables";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Invitation from "./_components/Invitation";

const InvitePage = async ({ searchParams }) => {
    const { token } = await searchParams;
    if (!token) redirect("/");
    const invitation = await db.workspaceInvitation.findUnique({
        where: { token },
        include: {
            workspace: {
                select: {
                    name: true,
                }
            },
            invitedBy: {
                select: {
                    name: true,
                    imageUrl: true,
                }
            }
        }
    });
    if (!invitation) redirect("/");
    if (invitation.status !== "PENDING") redirect("/");

    return (
        <div className="flex flex-col gap-3 items-center justify-center h-screen">
            <h1 className="text-4xl font-bold">
                <GoldTitle>You are joining {invitation.workspace.name} </GoldTitle>
            </h1>
            <Invitation invitation={invitation} />
        </div>
    );
};

export default InvitePage;