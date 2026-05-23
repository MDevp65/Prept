"use client"
import { getCurrentPlan, getWorkSpaceById, getWorkSpaceMembers } from '@/actions/workspace';
import PageHeader from '@/components/custom/reusables';
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/use-fetch';
import { Loader2, Settings, FolderKanban, Plus } from 'lucide-react';
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs';
import ManageWorkSpaceModal from '../_components/ManageWorkSpaceModal';
import MemberAvatars from '../_components/MemberAvatars';
import ProjectCard from '../_components/ProjectCard';
import CreateProjectDrawer from '../_components/CreateProjectDrawer';
import { getWorkSpaceProjects } from '@/actions/projects';

const WorkSpace = () => {
    const { workSpId } = useParams();
    const { user } = useUser();

    const { data: workspace, loading, fn: getWorkSpace, error } = useFetch(getWorkSpaceById)
    const { data: workspaceMembers, loading: isMembersLoading, fn: getWorkspaceMembers, error: membersError } = useFetch(getWorkSpaceMembers)
    const { data: projects, loading: areProjectsLoading, fn: getWorkspaceProjects, error: projectsError } = useFetch(getWorkSpaceProjects)
    const { data: plan, fn: getPlan } = useFetch(getCurrentPlan);
    const [showMangeModal, setShowManageModal] = useState(false);
    const [showCreateProjectDrawer, setShowCreateProjectDrawer] = useState(false);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        if (workSpId) {
            getWorkSpace(workSpId)
            getWorkspaceMembers(workSpId)
            getWorkspaceProjects(workSpId)
            getPlan();
        }
    }, [workSpId])

    useEffect(() => {
        if (user && workspaceMembers?.members && workspaceMembers?.members.length > 0) {
            // Find current user's role in workspace members
            const currentUserMember = workspaceMembers?.members.find(member => member.user?.email === user.primaryEmailAddress?.emailAddress);
            setUserRole(currentUserMember?.role || null);
        }
    }, [user, workspaceMembers]) 

    if (loading || isMembersLoading || areProjectsLoading) {
        return (
            <div className='flex flex-col gap-2 justify-center items-center min-h-screen'>
                <Loader2 size={50} className='animate-spin text-amber-400' />
                <p className='text-white/70 text-sm'>Loading Your Workspace...</p>
            </div>
        )
    }

    return (
        <main className="min-h-screen">
            {/* Page header */}
            <PageHeader
                label="WORKSPACE"
                gray="You're now in,"
                gold={workspace?.name ?? "WorkSpace"}
                children={
                    <div className='mt-2'>
                        <MemberAvatars members={workspace?.members ?? []} />
                    </div>
                }
                right={
                    userRole === "ADMIN" && (
                        <div className={`${projects?.length > 0 ? "flex flex-col gap-2" : ""}`}>
                            <Button variant='secondary' onClick={() => setShowManageModal(true)}>
                                <Settings size={25} />
                                Manage
                            </Button>
                            {
                                projects?.length > 0 && (
                                    <Button variant='gold' onClick={() => setShowCreateProjectDrawer(true)}>
                                        <Plus size={25} />
                                        Add Project
                                    </Button>
                                )
                            }
                        </div>
                    )
                }
            />
            <div className='container mx-auto my-7 px-4 md:px-0'>
                {
                    projects?.length === 0 ? (
                        userRole === "ADMIN" ? (
                            <div className="flex flex-col items-center justify-center py-16 px-6 border border-dashed border-white/20 bg-amber-400/5 rounded-2xl text-center mt-6 backdrop-blur-sm">
                                <div className="w-20 h-20 bg-amber-/10 rounded-full flex items-center justify-center mb-5 border border-amber-400/20 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                                    <FolderKanban size={36} className="text-amber-400" />
                                </div>
                                <h3 className="text-2xl font-serif text-amber-50 mb-2 tracking-wide">No Projects Yet</h3>
                                <p className="text-white/50 text-sm max-w-md mb-8 leading-relaxed">
                                    This workspace is currently empty. Get started by creating your first project to organize tasks, collaborate with members, and track your progress.
                                </p>
                                <Button variant="gold" onClick={() => setShowCreateProjectDrawer(true)} className="flex items-center gap-2 shadow-lg shadow-amber-400/20 hover:shadow-amber-400/40 transition-all duration-300 px-6 py-5 text-sm">
                                    <Plus size={18} />
                                    Create New Project
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 px-6 border border-dashed border-white/20 bg-amber-400/5 rounded-2xl text-center mt-6 backdrop-blur-sm">
                                <div className="w-20 h-20 bg-amber-/10 rounded-full flex items-center justify-center mb-5 border border-amber-400/20 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                                    <FolderKanban size={36} className="text-amber-400" />
                                </div>
                                <h3 className="text-2xl font-serif text-amber-50 mb-2 tracking-wide">No Projects Yet</h3>
                                <p className="text-white/50 text-sm max-w-md mb-8 leading-relaxed">
                                    This workspace is currently empty.
                                </p>
                            </div>
                        )
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {projects?.map((project) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>
                    )
                }
            </div>

            <CreateProjectDrawer
                open={showCreateProjectDrawer}
                onClose={() => setShowCreateProjectDrawer(false)}
                workspace={workspace}
                currentPlan={plan}
                onUpdate={() => {
                    getWorkspaceProjects(workSpId);
                }}
            />

            <ManageWorkSpaceModal
                isOpen={showMangeModal}
                onClose={() => setShowManageModal(false)}
                workspace={workspace}
                members={workspaceMembers}
                onUpdate={() => {
                    getWorkSpace(workSpId);
                    getWorkspaceMembers(workSpId);
                }}
            />
        </main>
    )
}

export default WorkSpace