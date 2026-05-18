"use client"
import { deleteMembersFromWorkSpace } from '@/actions/workspace'
import { GoldTitle, GrayTitle } from '@/components/custom/reusables'
import { Button } from '@/components/ui/button'
import useFetch from '@/hooks/use-fetch'
import { Loader2, Trash2, UserRound } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const ManageMembersPanel = ({ workspaceId, cancel, members, onUpdate }) => {
    const { data, error, loading, fn: delMembers } = useFetch(deleteMembersFromWorkSpace)
    const [memIds, setMemIds] = useState([]);

    const handleCheckbox = (id) => {
        if (memIds.includes(id)) {
            setMemIds(memIds.filter((memId) => memId !== id));
        } else {
            setMemIds([...memIds, id]);
        }
    }

    const handleDelete = () => {
        if (memIds.length === 0) {
            toast.error("Please select at least one member to delete");
            return;
        }

        delMembers({ workSpId: workspaceId, memberIds: memIds });
    }

    useEffect(() => {
        if (data?.success) {
            toast.success("Members deleted successfully!");
            if (onUpdate) onUpdate();
            cancel();
        }
        if (error) {
            toast.error(error);
        }
    }, [data])

    return (
        <div className="flex flex-col gap-3 h-full">
            <div className="text-center shrink-0">
                <h2 className='text-xl font-serif'>
                    <GoldTitle>{members?.name}'s Members</GoldTitle>
                </h2>
                <p>
                    <GrayTitle>
                        There are total {members?.members?.length} Members in this workspace
                    </GrayTitle>
                </p>
            </div>

            <div className="w-full min-w-0 rounded-md border border-white/10 overflow-x-auto overflow-y-auto max-h-64">
                <table className="w-full text-sm caption-bottom">
                    <caption className="mt-4 text-xs text-white/40">
                        A list of all the members in the workspace.
                    </caption>
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="h-10 px-3 text-left font-medium text-white/50 w-10">--</th>
                            <th className="h-10 px-3 text-left font-medium text-white/50 w-10">S.N.</th>
                            <th className="h-10 px-3 text-left font-medium text-white/50 w-12">Profile</th>
                            <th className="h-10 px-3 text-left font-medium text-white/50 min-w-[130px]">Name</th>
                            <th className="h-10 px-3 text-left font-medium text-white/50 min-w-[90px]">Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members?.members?.map((member, idx) => (
                            <tr key={member.id} className="border-b border-white/5 hover:bg-white/3">
                                <td className="px-3 py-3">
                                    {member?.role === "ADMIN" ? (
                                        <span className="text-white/30 text-xs">--</span>
                                    ) : (
                                        <input type="checkbox" disabled={loading} checked={memIds.includes(member.id)} onChange={() => handleCheckbox(member.id)} className="w-4 h-4 rounded-md border-white/10" />
                                    )}
                                </td>
                                <td className="px-3 py-3">{idx + 1}</td>
                                <td className="px-3 py-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center shrink-0">
                                        {member?.user?.imageUrl ? (
                                            <Image
                                                src={member.user.imageUrl}
                                                alt={member.user.name}
                                                width={32}
                                                height={32}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <UserRound className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                </td>
                                <td className="px-3 py-3 whitespace-nowrap">{member?.user?.name}</td>
                                <td className="px-3 py-3 whitespace-nowrap">{member?.role}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ← Always anchored below the table, never inside the scroll area */}
            <div className="flex flex-col md:flex-row gap-2 shrink-0 pt-1">
                <Button variant='outline' onClick={cancel} disabled={loading} className="w-full md:w-1/2">
                    Cancel
                </Button>
                <Button variant='gold' onClick={handleDelete} disabled={loading} className="w-full md:w-1/2">
                    {loading ? <Loader2 className="animate-spin" /> : "Delete"}
                </Button>
            </div>

        </div>
    )
}
export default ManageMembersPanel