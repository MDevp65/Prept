"use client"

import { sendInvitation } from '@/actions/invitations'
import { deleteWorkSpace } from '@/actions/workspace'
import { GoldTitle, GrayTitle } from '@/components/custom/reusables'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useFetch from '@/hooks/use-fetch'

import {
    Pencil,
    Settings,
    Trash2,
    UserPlus,
    Users,
    X
} from 'lucide-react'
import { useRouter } from 'next/navigation'

import React, { useState } from 'react'
import { toast } from 'sonner'
import ManageMembersPanel from './ManageMembersPanel'

const tabs = [
    { key: 'invite', label: 'Invitation', icon: UserPlus, danger: false },
    { key: 'manage', label: 'Manage', icon: Users, danger: false },
    { key: 'delete', label: 'Delete', icon: Trash2, danger: true },
]

const InvitationPanel = ({ workspace, cancel }) => {
    const { data, loading, fn: sendMail, error: mailError } = useFetch(sendInvitation)
    const [emails, setEmails] = useState([]);
    const [input, setInput] = useState("");
    const [error, setError] = useState("");

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleAdd = () => {
        const trimmed = input.trim().toLowerCase();
        if (!trimmed) return;

        if (!isValidEmail(trimmed)) {
            setError("Please enter a valid email address");
            return;
        }
        if (emails.includes(trimmed)) {
            setError("This email is already added");
            return;
        }

        setEmails(prev => [...prev, trimmed]);
        setInput("");
        setError("");
    };

    const handleRemove = (emailToRemove) => {
        setEmails(prev => prev.filter(e => e !== emailToRemove));
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
        }
    };

    const handleCancel = () => {
        setInput("")
        setError("")
        setEmails([])
        cancel()
    }

    const handleSendInvite = () => {
        if (emails.length === 0) toast.warning("Plz Add email to be sent!")
        sendMail(emails, workspace.id)
        // if(!loading && !mailError){
        toast.success("Invitation sent successfully!")
        handleCancel()
        // }
    }


    return (
        <div>
            <Label>Enter emails one by one</Label>

            <div className='flex flex-col items-end md:flex-row md:items-start gap-3 mt-4'>
                <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <Input
                        type="email"
                        placeholder="Enter email (example@gmail.com)"
                        className="w-full"
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value)
                            setError("")
                        }}
                        onKeyDown={handleKeyDown}
                    />
                    {error && (
                        <p className="text-xs text-red-400">{error}</p>
                    )}
                </div>
                <Button
                    variant='secondary'
                    className="w-fit md:w-14"
                    onClick={handleAdd}
                    type="button"
                >
                    ADD
                </Button>
            </div>

            {/* Email preview list */}
            <div className="w-full h-64 overflow-y-auto mt-4 mx-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {emails.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {emails.map((email) => (
                            <div
                                key={email}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-sm"
                            >
                                <span>{email}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemove(email)}
                                    className="text-amber-400/60 hover:text-red-400 transition-colors cursor-pointer"
                                >
                                    <X size={13} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className='flex flex-col md:flex-row gap-1 mb-4 md:mb-0'>
                <Button variant='outline' onClick={handleCancel} className={"w-full md:w-1/2"} disabled={loading}>Cancel</Button>
                <Button variant='gold' className={"w-full md:w-1/2"} onClick={handleSendInvite} disabled={loading}>Invite Members</Button>
            </div>
        </div>
    )
}
const DeletePanel = ({ workspace, cancel }) => {
    const router = useRouter();
    const { data, loading, error, fn: delWorkSpace } = useFetch(deleteWorkSpace);
    const handleDelete = () => {
        delWorkSpace(workspace?.id)
        setTimeout(() => {
            cancel()
            router.push("/workspace")
        }, 3000);

    }
    return (
        <div className="m-3">
            <h2 className="text-xl font-bold">
                <GoldTitle>Are you Sure to Delete?</GoldTitle>
            </h2>
            <p className="mt-2">
                <GrayTitle>
                    {workspace?.name} consists of {workspace?.projects?.length} projects and {workspace?.members?.length} members. This action cannot be undone and all the tasks, projects and members will delete permanently!
                </GrayTitle>
            </p>
            <div className="mt-3 flex items-center justify-end gap-3">
                <Button variant='outline' onClick={cancel} disabled={loading}>Cancel</Button>
                <Button variant='gold' onClick={handleDelete} disabled={loading}>
                    {
                        loading ? <>Deleting...</> : <>Delete</>
                    }
                </Button>
            </div>
        </div>
    )
}

const ManageWorkSpaceModal = ({ isOpen, onClose, workspace, members, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('invite')
    const handleCancle = () => {
        onClose();
        setActiveTab("invite")
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="border-amber-200/10 min-w-[60vw] max-h-[90vh] p-0 overflow-hidden">

                {/* Header */}
                <DialogHeader className="px-6 py-4 border-b border-white/7">
                    <div className="flex items-center gap-2.5">
                        <Settings size={22} className="text-amber-400" />
                        <DialogTitle className="font-serif text-xl">
                            Manage Your WorkSpace
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="flex min-h-105 overflow-hidden">

                    {/* Sidebar */}
                    <aside
                        className="
                            border-r border-white/7 p-2 flex flex-col gap-1 shrink-0
                            w-14 md:w-44 transition-all duration-200
                        "
                    >
                        {tabs.map(({ key, label, icon: Icon, danger }) => {
                            const isActive = activeTab === key

                            return (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key)}
                                    title={label}
                                    className={`
                                        w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                                        transition-all duration-150

                                        justify-center md:justify-start

                                        ${isActive
                                            ? danger
                                                ? 'bg-red-500/10 text-red-400 font-medium'
                                                : 'bg-amber-400/10 text-amber-400 font-medium'
                                            : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                                        }
                                    `}
                                >
                                    <Icon size={16} className="shrink-0" />

                                    {/* Show label only on md+ */}
                                    <span className="hidden md:inline truncate">
                                        {label}
                                    </span>
                                </button>
                            )
                        })}
                    </aside>

                    {/* Content */}
                    <main className="flex-1 p-6 overflow-y-auto min-w-0 min-h-0">
                        {activeTab === 'invite' && <InvitationPanel workspace={workspace} cancel={handleCancle} />}
                        {activeTab === 'manage' && <ManageMembersPanel workspaceId={workspace?.id} cancel={handleCancle} members={members} onUpdate={onUpdate} />}
                        {activeTab === 'delete' && <DeletePanel workspace={workspace} cancel={handleCancle} />}
                    </main>

                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ManageWorkSpaceModal