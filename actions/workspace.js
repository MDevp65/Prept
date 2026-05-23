"use server"

import { db } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache";

export const getCurrentPlan = async () => {
    const { has } = await auth();
    if (has({ plan: "pro" })) return "pro";
    if (has({ plan: "starter" })) return "starter";
    return "free";
};

const crtWrkSp = async (data, userId, noOfWorkspaces) => {
    try {
        const workspace = await db.$transaction(async (tx) => {
            const newWorkSpace = await tx.workspace.create({
                data: {
                    name: data.name,
                    slug: data.slug,
                    adminId: userId,
                    noOfFreeProjects: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            });

            await tx.workspaceMember.create({
                data: {
                    workspaceId: newWorkSpace.id,
                    userId: userId,
                    joinedAt: new Date(),
                    role: "ADMIN"
                }
            })

            await tx.user.update({
                where: { id: userId },
                data: {
                    noOfFreeWorkspace: noOfWorkspaces + 1,
                },
            });

            return newWorkSpace;
        });

        return { success: true, workspaceId: workspace.id };
    } catch (err) {
        console.error("WorkSpace creation failure in Helper:", err);
        throw new Error("WorkSpace creation failed in helper. Please try again.");
    }
}

export const createWorkSpace = async (data) => {
    try {
        const user = await currentUser();
        if (!user) throw new Error("Unauthorized");

        const dbUser = await db.user.findUnique({
            where: { clerkUserId: user.id },
        });

        if (!dbUser) throw new Error("User not found");

        const currentPlan = await getCurrentPlan();

        let newWorkSpace;

        if (currentPlan === "free") {
            if (dbUser.noOfFreeWorkspace >= 1) throw new Error("Plz Upgrade for more workspaces!");
            newWorkSpace = await crtWrkSp(data, dbUser.id, dbUser.noOfFreeWorkspace);
        }
        else if (currentPlan === "starter") {
            if (dbUser.noOfFreeWorkspace >= 5) throw new Error("Plz Upgrade for more workspaces!");
            newWorkSpace = await crtWrkSp(data, dbUser.id, dbUser.noOfFreeWorkspace);
        }
        else if (currentPlan === "pro") {
            if (dbUser.noOfFreeWorkspace >= 15) throw new Error("Too much workspaces!");
            newWorkSpace = await crtWrkSp(data, dbUser.id, dbUser.noOfFreeWorkspace);
        }

        revalidatePath("/workspace");
        return newWorkSpace;
    } catch (error) {
        console.error("WorkSpace creation failure:", error); // BUG FIX: was `err` (undefined), should be `error`
        throw new Error(error.message || "WorkSpace creation failed. Please try again.");
    }
}

export const getUserWorkSpaces = async () => {
    try {
        const user = await currentUser();
        if (!user) throw new Error("Unauthorized");

        const dbUser = await db.user.findUnique({
            where: { clerkUserId: user.id },
        });

        if (!dbUser) throw new Error("User not found");

        const workspaces = await db.workspace.findMany({
            where: {
                OR: [
                    { adminId: dbUser.id },
                    {
                        members: {
                            some: {
                                userId: dbUser.id
                            }
                        }
                    }
                ]
            },
            include: {
                members: true,
            },
            orderBy: { createdAt: "desc" }
        });

        return workspaces;
    } catch (error) {
        console.error("WorkSpace fetching failure:", error);
        throw new Error("WorkSpace fetching failed.");
    }
}

export const deleteWorkSpace = async (workspId) => {
    try {
        const user = await currentUser();
        if (!user) throw new Error("Unauthorized");

        const dbUser = await db.user.findUnique({
            where: { clerkUserId: user.id },
        });

        if (!dbUser) throw new Error("User not found");

        const workspace = await db.workspace.findUnique({
            where: { id: workspId }
        });

        if (!workspace) throw new Error("WorkSpace not found!"); // BUG FIX: was checking `!workspId` (always truthy if called), should check `!workspace`

        if (workspace.adminId !== dbUser.id) throw new Error("You are not allowed!");

        // Delete everything in the correct order to respect foreign key constraints:
        // Tasks → Projects → WorkspaceMembers → Workspace
        // (Tasks belong to Projects which belong to Workspaces)
        await db.$transaction(async (tx) => {
            // 1. Delete all tasks inside projects of this workspace
            await tx.task.deleteMany({
                where: {
                    project: {
                        workspaceId: workspId,
                    }
                }
            });

            // 2. Delete all projects in this workspace
            await tx.project.deleteMany({
                where: { workspaceId: workspId }
            });

            // 3. Delete all workspace members
            await tx.workspaceMember.deleteMany({
                where: { workspaceId: workspId }
            });

            // 4. Decrement the owner's workspace count
            await tx.user.update({
                where: { id: dbUser.id },
                data: {
                    noOfFreeWorkspace: {
                        decrement: 1,
                    }
                }
            });

            // 5. Finally delete the workspace itself
            await tx.workspace.delete({
                where: { id: workspId }
            });
        });

        revalidatePath("/workspace");
        return { success: true };
    } catch (error) {
        console.error("WorkSpace deletion failure:", error); // BUG FIX: catch block was completely empty
        throw new Error(error.message || "WorkSpace deletion failed. Please try again.");
    }
}

export const getWorkSpaceById = async (workspId) => {
    try {
        const user = await currentUser();
        if (!user) throw new Error("Unauthorized");

        const dbUser = await db.user.findUnique({
            where: { clerkUserId: user.id },
        });

        if (!dbUser) throw new Error("User not found");

        const workspace = await db.workspace.findUnique({
            where: { id: workspId },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                imageUrl: true,
                                email: true,
                            }
                        }
                    }
                },
                projects: true,
            },
        });

        if (!workspace) throw new Error("WorkSpace not found!");

        return workspace;
    } catch (error) {

        console.error("WorkSpace Access failure:", error); // BUG FIX: catch block was completely empty
        throw new Error(error.message || "WorkSpace Access failed. Please try again.");
    }
}

export const getWorkSpaceMembers = async (workSpId) => {
    try {
        const user = await currentUser();
        if (!user) throw new Error("Unauthorized");

        const dbUser = await db.user.findUnique({
            where: { clerkUserId: user.id },
        });

        if (!dbUser) throw new Error("User not found");

        const workspace = await db.workspace.findUnique({
            where: { id: workSpId },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                imageUrl: true,
                                email: true,
                            }
                        }
                    }
                },
            },
        });

        if (!workspace) throw new Error("WorkSpace not found!");

        return workspace;
    } catch (error) {
        console.error("WorkSpace members failure:", error);
        throw new Error("WorkSpace members failure");
    }
}

export const deleteMembersFromWorkSpace = async ({ workSpId, memberIds }) => {
    try {
        const user = await currentUser();
        if (!user) throw new Error("Unauthorized");

        const dbUser = await db.user.findUnique({
            where: { clerkUserId: user.id },
        });

        if (!dbUser) throw new Error("User not found");

        const workspace = await db.workspace.findUnique({
            where: { id: workSpId },
        })

        if (!workspace) throw new Error("Workspace not found!");

        if (workspace.adminId !== dbUser.id) throw new Error("You are not allowed to delete members from this workspace!");

        const areMembersInWorkspace = await db.workspaceMember.findMany({
            where: {
                workspaceId: workSpId,
                id: {
                    in: memberIds,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                    }
                }
            }
        })

        if (areMembersInWorkspace.length !== memberIds.length) throw new Error("Some members are not in the workspace!");

        await db.$transaction(async (tx) => {
            const userIdsToRemove = areMembersInWorkspace.map(m => m.userId);

            // Unassign tasks from these users in this workspace's projects
            await tx.task.updateMany({
                where: {
                    assignedToId: { in: userIdsToRemove },
                    project: {
                        workspaceId: workSpId
                    }
                },
                data: {
                    assignedToId: null
                }
            });

            await tx.workspaceInvitation.deleteMany({
                where: {
                    workspaceId: workSpId,
                    email: { in: areMembersInWorkspace.map((member) => member.user.email) }
                }
            });

            await tx.workspaceMember.deleteMany({
                where: {
                    workspaceId: workSpId,
                    id: {
                        in: memberIds,
                    }
                }
            })
        })

        return { success: true, message: "Members deleted successfully!" };
    } catch (error) {
        console.error("Members deletion failure:", error);
        throw new Error(error.message || "Members deletion failed. Please try again.");
    }
}

export const getWorkspaceDashboardStats = async () => {
    try {
        const user = await currentUser();
        if (!user) throw new Error("Unauthorized");

        const dbUser = await db.user.findUnique({
            where: { clerkUserId: user.id },
        });

        if (!dbUser) throw new Error("User not found");

        // 1. Get owned vs joined workspace counts
        const ownedCount = await db.workspace.count({
            where: { adminId: dbUser.id }
        });

        const joinedCount = await db.workspace.count({
            where: {
                adminId: { not: dbUser.id },
                members: {
                    some: { userId: dbUser.id }
                }
            }
        });

        // 2. Get tasks assigned to user (with project & workspace details)
        const tasksAssignedTo = await db.task.findMany({
            where: { assignedToId: dbUser.id },
            include: {
                project: {
                    include: {
                        workspace: true
                    }
                },
                assignedBy: {
                    select: {
                        id: true,
                        name: true,
                        imageUrl: true,
                        email: true
                    }
                }
            },
            orderBy: { updatedAt: "desc" }
        });

        // 3. Get tasks assigned by user to others
        const tasksAssignedBy = await db.task.findMany({
            where: { assignedById: dbUser.id },
            include: {
                project: {
                    include: {
                        workspace: true
                    }
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        imageUrl: true,
                        email: true
                    }
                }
            },
            orderBy: { updatedAt: "desc" }
        });

        // 4. Calculate task statuses breakdown for progress timeline
        const totalAssignedTasks = tasksAssignedTo.length;
        const completedTasks = tasksAssignedTo.filter(t => t.status === "COMPLETED").length;
        const inProgressTasks = tasksAssignedTo.filter(t => t.status === "INPROGRESS").length;
        const inReviewTasks = tasksAssignedTo.filter(t => t.status === "INREVIEW").length;
        const todoTasks = tasksAssignedTo.filter(t => t.status === "TODO").length;        

        return {
            totalWorkspacesOwned: ownedCount,
            totalWorkspacesJoined: joinedCount,
            tasksAssignedToMe: tasksAssignedTo,
            tasksAssignedByMe: tasksAssignedBy,
            stats: {
                totalTasks: totalAssignedTasks,
                completedTasks,
                inProgressTasks,
                inReviewTasks,
                todoTasks,
                completionRate: totalAssignedTasks > 0 ? Math.round((completedTasks / totalAssignedTasks) * 100) : 0
            }
        };
    } catch (error) {
        console.error("Dashboard stats fetching failure:", error);
        throw new Error("Dashboard stats fetching failed.");
    }
}