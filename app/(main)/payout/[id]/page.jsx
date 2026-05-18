import { GoldTitle, GrayTitle, SectionLabel } from '@/components/custom/reusables';
import { db } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import React from 'react'
import PayoutReviewClient from './_components/PayoutReviewClient';

const PayoutReviewPage = async ({ params }) => {
    const { id } = await params

    const payout = await db.payout.findUnique({
        where: { id },
        include: {
            interviewer: { select: { name: true, email: true } },
        },
    });

    if (!payout) notFound();

    return (
        <main className="min-h-screen bg-[#0a0a0b] text-stone-100 antialiased px-6 flex items-center justify-center">
            <div className="w-full max-w-sm flex flex-col gap-6">
                <div className="text-center">
                    <SectionLabel>Admin</SectionLabel>
                    <h1 className="font-serif text-4xl tracking-tighter mt-1">
                        <GrayTitle>Review </GrayTitle>
                        <GoldTitle>Withdrawal</GoldTitle>
                    </h1>
                </div>

                <PayoutReviewClient
                    payout={{
                        id: payout.id,
                        credits: payout.credits,
                        netAmount: payout.netAmount,
                        platformFee: payout.platformFee,
                        paymentMethod: payout.paymentMethod,
                        paymentDetail: payout.paymentDetail,
                        status: payout.status,
                        interviewerName: payout.interviewer.name,
                        interviewerEmail: payout.interviewer.email,
                    }}
                />
            </div>
        </main>
    )
}

export default PayoutReviewPage