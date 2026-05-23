"use server"

import { db } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export const getProjectTasks = async (projectId) => {
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
                        members: true
                    }
                }
            }
        });

        if (!project) throw new Error("Project not found!");

        const isMember = project.workspace.members.some(member => member.userId === dbUser.id);
        if (!isMember) throw new Error("You are not a member of this workspace!");

        const tasks = await db.task.findMany({
            where: { projectId: projectId },
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        imageUrl: true,
                        email: true,
                    }
                },
                assignedBy: {
                    select: {
                        id: true,
                        name: true,
                        imageUrl: true,
                        email: true,
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return tasks;
    } catch (error) {
        console.error("Task fetching failure:", error);
        throw new Error("Task fetching failed.");
    }
}

export const createTask = async (data) => {
    try {
        const user = await currentUser();
        if (!user) throw new Error("Unauthorized");

        const dbUser = await db.user.findUnique({
            where: { clerkUserId: user.id },
        });

        if (!dbUser) throw new Error("User not found");

        const project = await db.project.findUnique({
            where: { id: data.projectId },
            include: {
                workspace: {
                    include: {
                        members: true
                    }
                }
            }
        });

        if (!project) throw new Error("Project not found!");

        const memberRecord = project.workspace.members.find(member => member.userId === dbUser.id);
        if (!memberRecord) throw new Error("You are not a member of this workspace!");
        
        if (memberRecord.role !== "ADMIN") {
            throw new Error("Only workspace administrators can create tasks!");
        }

        const task = await db.task.create({
            data: {
                projectId: data.projectId,
                title: data.title,
                description: data.description,
                priority: data.priority || "MEDIUM",
                status: data.status || "TODO",
                assignedToId: data.assignedToId || null,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                assignedById: dbUser.id,
            }
        });

        return { success: true, task };
    } catch (error) {
        console.error("Task creation failure:", error);
        throw new Error("Task creation failed.");
    }
}

export const updateTask = async (taskId, data) => {
    try {
        const user = await currentUser();
        if (!user) throw new Error("Unauthorized");

        const dbUser = await db.user.findUnique({
            where: { clerkUserId: user.id },
        });

        if (!dbUser) throw new Error("User not found");

        const task = await db.task.findUnique({
            where: { id: taskId },
            include: {
                project: {
                    include: {
                        workspace: {
                            include: {
                                members: true
                            }
                        }
                    }
                }
            }
        });

        if (!task) throw new Error("Task not found!");

        const memberRecord = task.project.workspace.members.find(member => member.userId === dbUser.id);
        if (!memberRecord) throw new Error("You are not a member of this workspace!");
        
        if (memberRecord.role !== "ADMIN") {
            throw new Error("Only workspace administrators can update tasks!");
        }

        const updatedTask = await db.task.update({
            where: { id: taskId },
            data: {
                title: data.title,
                description: data.description,
                priority: data.priority,
                status: data.status,
                assignedToId: data.assignedToId || null,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
            }
        });

        return { success: true, task: updatedTask };
    } catch (error) {
        console.error("Task update failure:", error);
        throw new Error("Task update failed.");
    }
}

export const updateTaskStatus = async (taskId, newStatus) => {
    try {
        const user = await currentUser();
        if (!user) throw new Error("Unauthorized");

        const dbUser = await db.user.findUnique({
            where: { clerkUserId: user.id },
        });

        if (!dbUser) throw new Error("User not found");

        const task = await db.task.findUnique({
            where: { id: taskId },
            include: {
                project: {
                    include: {
                        workspace: {
                            include: {
                                members: true
                            }
                        }
                    }
                }
            }
        });

        if (!task) throw new Error("Task not found!");

        const memberRecord = task.project.workspace.members.find(member => member.userId === dbUser.id);
        if (!memberRecord) throw new Error("You are not a member of this workspace!");
        
        if (memberRecord.role !== "ADMIN") {
            throw new Error("Only workspace administrators can update task status!");
        }

        const updatedTask = await db.task.update({
            where: { id: taskId },
            data: {
                status: newStatus,
            }
        });

        return { success: true, task: updatedTask };
    } catch (error) {
        console.error("Task status update failure:", error);
        throw new Error("Task status update failed.");
    }
}

export const deleteTask = async (taskId) => {
    try {
        const user = await currentUser();
        if (!user) throw new Error("Unauthorized");

        const dbUser = await db.user.findUnique({
            where: { clerkUserId: user.id },
        });

        if (!dbUser) throw new Error("User not found");

        const task = await db.task.findUnique({
            where: { id: taskId },
            include: {
                project: {
                    include: {
                        workspace: {
                            include: {
                                members: true
                            }
                        }
                    }
                }
            }
        });

        if (!task) throw new Error("Task not found!");

        const memberRecord = task.project.workspace.members.find(member => member.userId === dbUser.id);
        if (!memberRecord) throw new Error("You are not a member of this workspace!");

        // Only workspace admins can delete tasks
        if (memberRecord.role !== "ADMIN") {
            throw new Error("Only workspace administrators can delete tasks!");
        }

        await db.task.delete({
            where: { id: taskId }
        });

        return { success: true };
    } catch (error) {
        console.error("Task deletion failure:", error);
        throw new Error(error.message || "Task deletion failed.");
    }
}
