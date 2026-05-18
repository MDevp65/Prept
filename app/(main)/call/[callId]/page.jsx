import React from 'react'
import { getCallData } from '@/actions/call';
import { toast } from 'sonner';
import { notFound, redirect } from 'next/navigation';
import CallRoom from './_components/CallRoom';
import DesktopOnlyCard from '@/components/custom/DesktopOnlyCard';

const CallPage = async ({ params }) => {
  const { callId } = await params;
  const reslut = await getCallData(callId)

  if (reslut.error === "Unauthorized") {
    toast.error("You must be signed in to access this call");
    redirect("/")
  }

  if (reslut.error === "Call not found") {
    toast.error("This call does not exist");
    notFound();
  }

  if (reslut.error === "Forbidden") {
    toast.error("You are not authorized to access this call");
    redirect("/")
  }

  const { token, isInterviewer, currentUser, booking } = reslut;

  return (
    <>
      <div className="block xl:hidden">
        <DesktopOnlyCard />
      </div>
      <div className="hidden xl:block">
        <CallRoom
          callId={callId}
          token={token}
          apiKey={process.env.NEXT_PUBLIC_STREAM_API_KEY}
          currentUser={currentUser}
          booking={booking}
          isInterviewer={isInterviewer}
        />
      </div>
    </>
  )
}

export default CallPage
