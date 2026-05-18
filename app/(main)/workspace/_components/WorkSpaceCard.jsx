"use client"
import { Card, CardContent } from '@/components/ui/card'
import { BriefcaseBusiness } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

const WorkSpaceCard = ({ workspace }) => {
    const router = useRouter();
    return (
        <Card
            onClick={() => router.push(`/workspace/${workspace.id}`)}
            className="group relative overflow-hidden cursor-pointer
        bg-[#0f0f11] border border-white/8 rounded-2xl
        transition-all duration-250
        hover:border-amber-400/35 hover:-translate-y-0.5"
        >
            {/* Amber glow on hover */}
            <div className="absolute inset-0 bg-linear-to-t from-amber-400/6 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none" />

            <CardContent className="relative p-6 flex flex-col gap-0">

                {/* Top row — name + go arrow */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                        <BriefcaseBusiness size={22} className="text-amber-400" />
                        <span className="text-amber-300 font-medium text-lg">{workspace.name}</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-medium tracking-wide text-amber-400
            opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0
            transition-all duration-200 whitespace-nowrap">
                        Open workspace
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </span>
                </div>

                {/* Amber sweep bar */}
                <div className="h-px bg-white/6 rounded-full mb-5 overflow-hidden">
                    <div className="h-full w-0 group-hover:w-full bg-linear-to-r from-amber-900 to-amber-400 rounded-full transition-all duration-350 ease-out" />
                </div>

                {/* <hr className="border-white/7 mb-5" /> */}

                {/* Fields grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase tracking-widest text-white/30">Slug</span>
                        <code className="text-xs bg-white/5 text-white/35 px-1.5 py-0.5 rounded w-fit">{workspace.slug}</code>
                    </div>

                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase tracking-widest text-white/30">Projects</span>
                        <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-white/50 w-fit">
                            {workspace.noOfFreeProjects} projects
                        </span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase tracking-widest text-white/30">Members</span>
                        <span className="text-xs px-2 py-0.5 rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-400 w-fit">
                            {workspace.members.length} members
                        </span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase tracking-widest text-white/30">Created</span>
                        <span className="text-sm text-white/70">
                            {new Date(workspace.createdAt).toLocaleDateString("en-US", {
                                month: "short", day: "numeric", year: "numeric"
                            })}
                        </span>
                    </div>

                    <div className="col-span-2 flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase tracking-widest text-white/30">Workspace ID</span>
                        <span className="text-[11px] font-mono text-white/25 break-all">{workspace.id}</span>
                    </div>
                </div>

            </CardContent>
        </Card>
    )
}

export default WorkSpaceCard