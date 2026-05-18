"use client";

import { GoldTitle } from '@/components/custom/reusables'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import useFetch from '@/hooks/use-fetch'
import { createTask, updateTask } from '@/actions/tasks'
import dynamic from 'next/dynamic'

const MDEditor = dynamic(
    () => import("@uiw/react-md-editor"),
    { ssr: false }
);

const INITIAL_FORM = {
    title: "",
    description: "",
    priority: "MEDIUM",
    status: "TODO",
    assignedToId: "",
    startDate: null,
    endDate: null,
}

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"]
const STATUSES = ["TODO", "INPROGRESS", "INREVIEW", "COMPLETED"]

const TaskDrawer = ({ open, onClose, project, task, onUpdate }) => {
    const { data: createData, loading: isCreating, error: createError, fn: executeCreate } = useFetch(createTask)
    const { data: updateData, loading: isUpdating, error: updateError, fn: executeUpdate } = useFetch(updateTask)

    const [form, setForm] = useState(INITIAL_FORM);

    useEffect(() => {
        if (task && open) {
            setForm({
                title: task.title || "",
                description: task.description || "",
                priority: task.priority || "MEDIUM",
                status: task.status || "TODO",
                assignedToId: task.assignedToId || "",
                startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : null,
                endDate: task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : null,
            })
        } else {
            setForm(INITIAL_FORM)
        }
    }, [task, open])

    const handleCancel = () => {
        setForm(INITIAL_FORM)
        onClose()
    }

    const handleSave = () => {
        if (!form.title) {
            toast.error("Title is required")
            return
        }

        if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
            toast.error("End date must be after start date")
            return
        }

        const payload = {
            ...form,
            projectId: project.id,
            startDate: form.startDate ? new Date(form.startDate) : null,
            endDate: form.endDate ? new Date(form.endDate) : null
        }

        if (task) {
            executeUpdate(task.id, payload)
        } else {
            executeCreate(payload)
        }
    }

    useEffect(() => {
        if (createData?.success || updateData?.success) {
            toast.success(task ? "Task updated successfully" : "Task created successfully")
            onUpdate()
            handleCancel()
        }
        if (createError) toast.error(createError)
        if (updateError) toast.error(updateError)
    }, [createData, updateData, createError, updateError])

    const loading = isCreating || isUpdating

    return (
        <Drawer open={open} onOpenChange={handleCancel}>
            <DrawerContent className={"bg-amber-400/3 border-amber-400/10 max-h-[92vh] flex flex-col"}>
                <DrawerHeader className="shrink-0 border-b border-white/5">
                    <DrawerTitle className={"text-2xl font-serif font-bold"}>
                        <GoldTitle>{task ? "Edit Task" : "Create a Task"}</GoldTitle>
                    </DrawerTitle>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto px-8 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <form className='grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8'>
                        {/* Left Column */}
                        <div className="flex flex-col gap-6">
                            <div className='flex flex-col gap-3'>
                                <Label htmlFor="title" className="text-amber-400/80">Title</Label>
                                <Input
                                    type="text"
                                    placeholder="Task Title"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="bg-white/5 border-amber-400/20 focus:border-amber-400 focus:ring-amber-400/20 text-lg py-6"
                                />
                            </div>
                            <div className='flex flex-col gap-3 flex-1'>
                                <Label htmlFor="desc" className="text-amber-400/80">Description</Label>
                                <div data-color-mode="dark" className="border border-amber-400/20 rounded-md overflow-hidden">
                                    <MDEditor
                                        value={form.description}
                                        onChange={(val) => setForm({ ...form, description: val || "" })}
                                        height={300}
                                        style={{ backgroundColor: 'transparent' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-3">
                                <Label className="text-amber-400/80">Priority</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {PRIORITIES.map((p) => (
                                        <div
                                            key={p}
                                            onClick={() => setForm({ ...form, priority: p })}
                                            className={`py-2 px-1 rounded-xl border cursor-pointer transition-all duration-200 text-center text-[10px] font-bold uppercase tracking-wider
                                                ${form.priority === p ? 'bg-amber-400 border-amber-400 text-black shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 'bg-white/5 border-amber-400/20 text-white/60 hover:border-amber-400/50 hover:bg-white/10'}`}
                                        >
                                            {p}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Label className="text-amber-400/80">Status</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {STATUSES.map((s) => (
                                        <div
                                            key={s}
                                            onClick={() => setForm({ ...form, status: s })}
                                            className={`py-2 px-1 rounded-xl border cursor-pointer transition-all duration-200 text-center text-[10px] font-bold uppercase tracking-wider
                                                ${form.status === s ? 'bg-amber-400 border-amber-400 text-black shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 'bg-white/5 border-amber-400/20 text-white/60 hover:border-amber-400/50 hover:bg-white/10'}`}
                                        >
                                            {s}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Label className="text-amber-400/80">Assignee</Label>
                                <select
                                    value={form.assignedToId || ""}
                                    onChange={(e) => setForm({ ...form, assignedToId: e.target.value })}
                                    className="bg-zinc-900 border border-amber-400/20 focus:border-amber-400 rounded-md p-2.5 text-sm text-white/90 outline-none"
                                >
                                    <option value="">Unassigned</option>
                                    {project?.workspace?.members?.map(m => (
                                        <option key={m.userId} value={m.userId}>{m.user?.name || m.user?.email || "Unknown User"}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className='flex flex-col gap-3 flex-1'>
                                    <Label htmlFor="startDate" className="text-amber-400/80">Start</Label>
                                    <Input
                                        type="date"
                                        value={form.startDate || ""}
                                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                        onClick={(e) => e.target.showPicker?.()}
                                        className="bg-white/5 border-amber-400/20 focus:border-amber-400 scheme-dark cursor-pointer text-xs"
                                    />
                                </div>
                                <div className='flex flex-col gap-3 flex-1'>
                                    <Label htmlFor="endDate" className="text-amber-400/80">Due</Label>
                                    <Input
                                        type="date"
                                        value={form.endDate || ""}
                                        min={form.startDate || ""}
                                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                        onClick={(e) => e.target.showPicker?.()}
                                        className="bg-white/5 border-amber-400/20 focus:border-amber-400 scheme-dark cursor-pointer text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <DrawerFooter className="flex flex-col md:flex-row gap-4 px-8 pb-8 border-t border-white/5 pt-4">
                    <Button variant="secondary" disabled={loading} onClick={handleCancel} className="w-full md:w-1/2 uppercase font-bold tracking-widest">
                        Cancel
                    </Button>
                    <Button variant="gold" disabled={loading} className="w-full md:w-1/2 uppercase font-bold tracking-widest" onClick={handleSave}>
                        {loading ? (<Loader2 size={20} className='animate-spin text-amber-400' />) : task ? "Update Task" : "Create Task"}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export default TaskDrawer;
