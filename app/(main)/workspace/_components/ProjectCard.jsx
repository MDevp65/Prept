import React from 'react'
import { motion } from 'motion/react'
import {
    Code,
    Smartphone,
    Database,
    Cpu,
    Palette,
    Megaphone,
    Search,
    LayoutGrid,
    Calendar,
    ArrowRight
} from 'lucide-react'
import { format } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'

const CATEGORIES = {
    WEB: { label: "Web", icon: Code, color: "from-blue-500/20 to-cyan-500/20" },
    MOBILE: { label: "Mobile", icon: Smartphone, color: "from-purple-500/20 to-pink-500/20" },
    DATA: { label: "Data", icon: Database, color: "from-green-500/20 to-emerald-500/20" },
    ML: { label: "ML/AI", icon: Cpu, color: "from-orange-500/20 to-red-500/20" },
    DESIGN: { label: "Design", icon: Palette, color: "from-pink-500/20 to-rose-500/20" },
    MARKETING: { label: "Marketing", icon: Megaphone, color: "from-yellow-500/20 to-amber-500/20" },
    RESEARCH: { label: "Research", icon: Search, color: "from-indigo-500/20 to-blue-500/20" },
    OTHER: { label: "Other", icon: LayoutGrid, color: "from-zinc-500/20 to-slate-500/20" },
};

const ProjectCard = ({ project }) => {
    const category = CATEGORIES[project.category] || CATEGORIES.OTHER;
    const Icon = category.icon;

    // Calculate progress percentage based on current date
    const start = new Date(project.startTime);
    const end = new Date(project.endTime);
    const now = new Date();

    let progress = 0;
    if (now > end) progress = 100;
    else if (now > start) {
        const total = end - start;
        const current = now - start;
        progress = Math.min(Math.round((current / total) * 100), 100);
    }

    const statusColors = {
        TOBESTART: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        INPROCESS: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    }

    return (
        <Link href={`/project/${project.id}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="group relative flex flex-col h-full bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden transition-all duration-300 hover:border-amber-400/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(251,191,36,0.05)]"
            >
                {/* Background Gradient Glow */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${category.color} blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="p-6 flex flex-col flex-1 relative z-10">
                    {/* Header: Category & Status */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <Icon size={14} className="text-amber-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                                {category.label}
                            </span>
                        </div>

                        <div className={`px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-tighter ${statusColors[project.status]}`}>
                            {project.status === "TOBESTART" ? "Upcoming" : project.status === "INPROCESS" ? "In Progress" : "Completed"}
                        </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl font-serif font-bold text-white mb-3 group-hover:text-amber-400 transition-colors line-clamp-1">
                        {project.title}
                    </h3>

                    <p className="text-white/40 text-sm leading-relaxed line-clamp-3 mb-6">
                        {project.description}
                    </p>

                    {/* Progress Section */}
                    <div className="mt-auto space-y-4">
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/30">
                                <span>Timeline</span>
                                <span className="text-amber-400/60">{progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-linear-to-r from-amber-500 to-amber-300 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                                />
                            </div>
                        </div>

                        {/* Timeline & User */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2 text-white/50">
                                <Calendar size={14} />
                                <span className="text-[11px] font-medium">
                                    {format(start, "MMM d")} - {format(end, "MMM d")}
                                </span>
                            </div>

                            <div className="flex items-center -space-x-2">
                                {project.createdBy && (
                                    <div className="relative group/user">
                                        <div className="w-7 h-7 rounded-full border-2 border-zinc-900 overflow-hidden bg-zinc-800">
                                            <Image
                                                src={project.createdBy.imageUrl}
                                                alt={project.createdBy.name}
                                                width={28}
                                                height={28}
                                                className="object-cover"
                                            />
                                        </div>
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 text-[10px] text-white rounded whitespace-nowrap opacity-0 group-hover/user:opacity-100 transition-opacity pointer-events-none border border-white/10 uppercase tracking-widest">
                                            {project.createdBy.name}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Overlay */}
                <div className="h-1 w-full bg-amber-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </motion.div>
        </Link>
    )
}

export default ProjectCard
