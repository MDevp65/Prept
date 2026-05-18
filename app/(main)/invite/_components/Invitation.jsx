"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, X, Calendar, Mail, Loader2 } from "lucide-react"
import { format } from "date-fns"
import useFetch from '@/hooks/use-fetch'
import { handleInvitation } from '@/actions/invitations'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { SignInButton, useUser } from '@clerk/nextjs'

const Invitation = ({ invitation }) => {
    const [action, setAction] = useState("ACCEPTED")
    const router = useRouter();
    const { isSignedIn } = useUser();
    const {
        workspace,
        invitedBy,
        email,
        expiresAt,
        status,
    } = invitation;

    const { data, loading, error, fn } = useFetch(handleInvitation);

    useEffect(() => {
        if (data?.success && !loading && action) {
            toast.success(`${action}_THE_INVITATION from ${workspace?.name}`);
            router.push("/");
        }
    }, [data]);

    const handleInvite = (action) => {
        setAction(action);
        if (action === "ACCEPTED") {
            if (!isSignedIn) return;
        }
        fn(invitation?.token, action);
    }

    return (
        <Card className="w-full max-w-md mx-auto border-amber-500/20 bg-black/60 backdrop-blur-xl shadow-2xl">
            <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-serif text-amber-400">Workspace Invitation</CardTitle>
                <CardDescription className="text-zinc-400">
                    You have been invited to collaborate
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-5 pt-4 pb-6">

                {/* Inviter Info */}
                <div className="flex flex-col items-center gap-3">
                    <Avatar className="h-20 w-20 border-2 border-amber-400/50 shadow-lg shadow-amber-400/10">
                        <AvatarImage src={invitedBy?.imageUrl} alt={invitedBy?.name} />
                        <AvatarFallback className="bg-amber-950 text-amber-400 font-bold text-xl">
                            {invitedBy?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                        <p className="text-lg font-medium text-zinc-100">{invitedBy?.name}</p>
                        <p className="text-sm text-zinc-400">invited you to join</p>
                    </div>
                </div>

                {/* Workspace Name */}
                <div className="bg-amber-400/10 border border-amber-400/20 px-8 py-4 rounded-xl w-full text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-linear-to-r from-amber-400/0 via-amber-400/5 to-amber-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <p className="text-2xl font-bold text-amber-300 tracking-wide">{workspace?.name}</p>
                </div>

                {/* Meta Info */}
                <div className="flex flex-col w-full gap-2 mt-2 px-2 text-sm text-zinc-400">
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-amber-400/70" />
                        <span className="truncate">Sent to <span className="text-zinc-300">{email}</span></span>
                    </div>
                    {expiresAt && (
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-amber-400/70" />
                            <span>Expires on <span className="text-zinc-300">{format(new Date(expiresAt), 'PPP')}</span></span>
                        </div>
                    )}
                </div>

            </CardContent>

            {status === "PENDING" && (
                <CardFooter className="flex gap-3 pt-2 pb-6 px-6">
                    <Button
                        variant="outline"
                        className="w-1/2 border-zinc-700 bg-zinc-900/50 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all duration-300"
                        onClick={() => handleInvite("REJECTED")}
                        disabled={loading}
                    >
                        {
                            loading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <>
                                    <X className="w-4 h-4 mr-2" />
                                    Reject
                                </>
                            )
                        }
                    </Button>
                    {isSignedIn ? (
                        <Button
                            variant="gold"
                            className="w-1/2"
                            onClick={() => handleInvite("ACCEPTED")}
                            disabled={loading}
                        >
                            {
                                loading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Accept
                                    </>
                                )
                            }
                        </Button>
                    ) : (
                        <SignInButton forceRedirectUrl={`/invite?token=${invitation.token}`} mode="modal">
                            <Button
                                variant="gold"
                                className="w-1/2"
                                disabled={loading}
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Sign in to Accept
                            </Button>
                        </SignInButton>
                    )}

                </CardFooter>
            )}

            {status !== "PENDING" && (
                <CardFooter className="flex justify-center pb-6">
                    <p className="text-sm text-zinc-500 italic">This invitation is no longer pending.</p>
                </CardFooter>
            )}
        </Card>
    )
}

export default Invitation