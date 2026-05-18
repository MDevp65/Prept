"use client"
import { createWorkSpace } from '@/actions/workspace'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useFetch from '@/hooks/use-fetch'
import { BriefcaseBusiness, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'

const WORKSPACEDATA = {
    name: "",
    slug: "",
}

const CreateWorkSpaceModal = ({ isOpen, onClose, canCreate }) => {
    const { data: workspace, loading, error, fn: createWorkSP } = useFetch(createWorkSpace);
    const router = useRouter()

    const [data, setData] = useState(WORKSPACEDATA);

    const handleNameChange = (e) => {
        const name = e.target.value;
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        setData({ ...data, name, slug });
    };

    const handleClose = () => {
        setData(WORKSPACEDATA)
        onClose();
    }

    const handleCreate = () => {
        if (!canCreate) toast.warning("Plz Upgrade for more workspaces!")
        if (!data.name || !data.slug) toast.warning("Plz fill out required fields")

        createWorkSP({
            name: data.name,
            slug: data.slug,
        })
        if (!loading) {
            router.refresh("/workspace");
            handleClose();
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className={"border-amber-200/10 min-w-[45vw] max-h-[90vh]"}>
                <DialogHeader className={"flex items-center"}>
                    <div className="flex items-start gap-2 mb-2">
                        <BriefcaseBusiness size={30} className='text-amber-400' />
                        {/* <div> */}
                        <DialogTitle className="font-serif text-2xl">
                            Create Your WorkSpace
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="my-2">
                    <div className="mt-3">
                        <Label htmlFor="name" className="text-sm mb-1">
                            WorkSpace Name
                        </Label>
                        <Input type={"text"} placeholder="Name your workspace" value={data.name || ""} onChange={handleNameChange} />
                    </div>
                    <div className="mt-3">
                        <Label htmlFor="slug" className="text-sm mb-1">
                            WorkSpace's Slug
                        </Label>
                        <Input type={"text"} placeholder="Enter slug..." value={data.slug || ""} onChange={(e) => setData({ ...data, slug: e.target.value })} />
                    </div>
                </div>

                <DialogFooter className={"flex items-center justify-between"}>
                    <Button variant='outline' onClick={handleClose} className={"w-1/2"} disabled={loading}>Cancel</Button>
                    <Button variant='gold' onClick={handleCreate} className={"w-1/2"} disabled={loading || !data.name || !data.slug}>
                        {
                            loading ? (
                                <>
                                    <Loader2 size={25} className='animate-spin' />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    Create
                                </>
                            )
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateWorkSpaceModal