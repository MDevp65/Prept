import { GoldTitle } from '@/components/custom/reusables'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import React, { useEffect, useState } from 'react'
import {
    Code,
    Smartphone,
    Database,
    Cpu,
    Palette,
    Megaphone,
    Search,
    LayoutGrid,
    Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import useFetch from '@/hooks/use-fetch'
import { createNewProject } from '@/actions/projects'
import UpgradeModal from '@/components/custom/UpgradeModal'

const CATEGORIES = [
    { id: "WEB", label: "Web", icon: Code },
    { id: "MOBILE", label: "Mobile", icon: Smartphone },
    { id: "DATA", label: "Data", icon: Database },
    { id: "ML", label: "ML/AI", icon: Cpu },
    { id: "DESIGN", label: "Design", icon: Palette },
    { id: "MARKETING", label: "Marketing", icon: Megaphone },
    { id: "RESEARCH", label: "Research", icon: Search },
    { id: "OTHER", label: "Other", icon: LayoutGrid },
];

const INITIAL_FORM = {
    title: "",
    description: "",
    category: "",
    startTime: null,
    endTime: null,
}

const CreateProjectDrawer = ({ open, onClose, workspace, currentPlan, onUpdate }) => {

    const { data, loading, error, fn: executeCreate } = useFetch(createNewProject)

    const [form, setForm] = useState(INITIAL_FORM);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const canCreate = currentPlan === "free" ? (workspace?.projects?.length < 1) : (workspace?.projects?.length < 3)

    const handleCategoryToggle = (id) => {
        setForm(prev => ({
            ...prev,
            category: prev.category === id ? "" : id
        }))
    }

    const handleCancel = () => {
        setForm(INITIAL_FORM)
        onClose()
    }

    const handleCreate = () => {
        if (!canCreate) {
            toast.warning(`${currentPlan === "free" ? "Plz Upgrade to create more projects" : "You can only create 3 projects in a workspace!"}`)
            if (currentPlan === "free") {
                handleCancel();
                setShowUpgradeModal(true)
            }
            return
        }

        if (!form.title || !form.description || !form.category || !form.startTime || !form.endTime) {
            toast.error("All fields are required")
            return
        }

        if (new Date(form.endTime) <= new Date(form.startTime)) {
            toast.error("End time must be after start time")
            return
        }

        executeCreate({
            ...form,
            workspaceId: workspace.id,
            startTime: form.startTime ? new Date(form.startTime) : null,
            endTime: form.endTime ? new Date(form.endTime) : null
        })
    }

    useEffect(() => {
        if (data?.success) {
            setForm(INITIAL_FORM)
            toast.success("Project created successfully")
            onUpdate()
            onClose()
        }

        if (error) {
            toast.error(error)
        }
    }, [data, error])


    return (
        <>
            <Drawer open={open} onOpenChange={handleCancel}>
                <DrawerContent className={"bg-amber-400/3 border-amber-400/10 max-h-[92vh] flex flex-col"}>
                    <DrawerHeader className="shrink-0 border-b border-white/5">
                        <DrawerTitle className={"text-2xl font-serif font-bold"}>
                            <GoldTitle>Create a Project</GoldTitle>
                        </DrawerTitle>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto px-8 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <form className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                            <div className="flex flex-col gap-6">
                                <div className='flex flex-col gap-3'>
                                    <Label htmlFor="title" className="text-amber-400/80">Title</Label>
                                    <Input
                                        type="text"
                                        placeholder="Give your project a name"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        className="bg-white/5 border-amber-400/20 focus:border-amber-400 focus:ring-amber-400/20"
                                    />
                                </div>
                                <div className='flex flex-col gap-3'>
                                    <Label htmlFor="desc" className="text-amber-400/80">Description</Label>
                                    <Textarea
                                        className={"resize-none min-h-[180px] bg-white/5 border-amber-400/20 focus:border-amber-400 focus:ring-amber-400/20"}
                                        placeholder="Describe your project"
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-3">
                                    <Label className="text-amber-400/80">Category</Label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {CATEGORIES.map((cat) => (
                                            <div
                                                key={cat.id}
                                                onClick={() => handleCategoryToggle(cat.id)}
                                                className={`
                                                flex flex-col items-center justify-center py-2 px-1 rounded-xl border cursor-pointer transition-all duration-200
                                                gap-1 text-center h-16
                                                ${form.category === cat.id
                                                        ? 'bg-amber-400 border-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                                                        : 'bg-white/5 border-amber-400/20 text-white/60 hover:border-amber-400/50 hover:bg-white/10'
                                                    }
                                            `}
                                            >
                                                <cat.icon size={18} />
                                                <span className="text-[9px] font-medium uppercase tracking-wider leading-none">{cat.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 md:mt-5">
                                    <div className='flex flex-col gap-3 flex-1'>
                                        <Label htmlFor="startTime" className="text-amber-400/80">Start Date</Label>
                                        <Input
                                            type="date"
                                            value={form.startTime || ""}
                                            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                                            onClick={(e) => e.target.showPicker?.()}
                                            className="bg-white/5 border-amber-400/20 focus:border-amber-400 scheme-dark cursor-pointer"
                                        />
                                    </div>
                                    <div className='flex flex-col gap-3 flex-1'>
                                        <Label htmlFor="endTime" className="text-amber-400/80">End Date</Label>
                                        <Input
                                            type="date"
                                            value={form.endTime || ""}
                                            min={form.startTime || ""}
                                            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                                            onClick={(e) => e.target.showPicker?.()}
                                            className="bg-white/5 border-amber-400/20 focus:border-amber-400 scheme-dark cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <DrawerFooter className="flex flex-col md:flex-row gap-4 px-8 pb-8 border-t border-white/5 pt-4">
                        <Button variant="secondary" disabled={loading} onClick={handleCancel} className="w-full md:w-1/2 uppercase">
                            Cancel
                        </Button>
                        <Button variant="gold" disabled={loading} className="w-full md:w-1/2 uppercase" onClick={handleCreate}>
                            {loading ? (<Loader2 size={20} className='animate-spin text-amber-400' />) : "Create Project"}
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
            <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} reason='Project Limit Reached' />
        </>
    )
}

export default CreateProjectDrawer