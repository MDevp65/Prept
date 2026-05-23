"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import useFetch from '@/hooks/use-fetch'
import { getProjectById, deleteProject } from '@/actions/projects'
import { getProjectTasks } from '@/actions/tasks'
import { getWorkSpaceMembers } from '@/actions/workspace'
import PageHeader from '@/components/custom/reusables'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import KanbanBoard from './_components/KanbanBoard'
import TaskDrawer from './_components/TaskDrawer'
import DesktopOnlyCard from '@/components/custom/DesktopOnlyCard'
const ProjectPage = () => {
    const { projId } = useParams();
    const router = useRouter();
    const { user } = useUser();

    const { data: project, loading, fn: fetchProject, error } = useFetch(getProjectById);
    const { data: tasks, loading: tasksLoading, fn: fetchTasks } = useFetch(getProjectTasks);
    const { data: delData, loading: isDeleting, fn: delProj } = useFetch(deleteProject);
    const { data: workspaceMembers, fn: getWorkspaceMembers } = useFetch(getWorkSpaceMembers);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        if (projId) {
            fetchProject(projId);
            fetchTasks(projId);
        }
    }, [projId]);

    useEffect(() => {
        if (project) {
            getWorkspaceMembers(project.workspaceId);
        }
    }, [project]);

    useEffect(() => {
        if (user && workspaceMembers?.members && workspaceMembers?.members.length > 0) {
            const currentUserMember = workspaceMembers?.members.find(member => member.user?.email === user.primaryEmailAddress?.emailAddress);
            setUserRole(currentUserMember?.role || null);
        }
    }, [user, workspaceMembers]);

    const handleOpenDrawer = (task = null) => {
        setSelectedTask(task);
        setIsDrawerOpen(true);
    };

    const handleDeleteProject = async () => {
        if (window.confirm("Are you sure you want to delete this project with all the tasks associated with it? This action cannot be undone.")) {
            try {
                delProj(projId);
                toast.success("Project deleted successfully");
                router.push(`/workspace/${project.workspaceId}`);
            } catch (error) {
                toast.error(error.message || "Failed to delete project");
            }
        }
    }

    if (loading) {
        return (
            <div className='flex flex-col gap-2 justify-center items-center min-h-[70vh]'>
                <Loader2 size={50} className='animate-spin text-amber-400' />
                <p className='text-white/70 text-sm'>Loading Project Details...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className='flex flex-col gap-2 justify-center items-center min-h-[70vh] text-red-500'>
                <p>{error.message || "Something went wrong!"}</p>
            </div>
        )
    }

    if (!project) return null;

    return (
        <>
            <div className="block xl:hidden">
                <DesktopOnlyCard />
            </div>
            <main className="hidden xl:block min-h-screen">
                <PageHeader
                    label="PROJECT"
                    gray="Project details for,"
                    gold={project.title}
                    description={project.description}
                    right={
                        userRole === "ADMIN" && (
                            <Button variant='destructive' disabled={isDeleting} onClick={handleDeleteProject} className="flex items-center gap-2">
                                <Trash2 size={18} />
                                Delete Project
                            </Button>
                        )
                    }
                />

                {tasksLoading ? (
                    <div className='flex justify-center items-center py-20'>
                        <Loader2 size={40} className='animate-spin text-amber-400' />
                    </div>
                ) : (
                    <KanbanBoard
                        tasks={tasks || []}
                        onTaskUpdate={() => fetchTasks(projId)}
                        onEditTask={handleOpenDrawer}
                        onAddTask={() => handleOpenDrawer(null)}
                        userRole={userRole}
                    />
                )}

                {project && (
                    <TaskDrawer
                        open={isDrawerOpen}
                        onClose={() => setIsDrawerOpen(false)}
                        project={project}
                        task={selectedTask}
                        onUpdate={() => fetchTasks(projId)}
                    />
                )}
            </main>
        </>
    )
}

export default ProjectPage