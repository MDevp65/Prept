import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import { getInterviewerProfile } from "@/actions/booking";
import { Badge } from "@/components/ui/badge";
import SlotPicker from "./_components/SlotPicker";
import { StarsBackgroundDemo } from "@/components/demo-components-backgrounds-stars";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABEL, EXPECT_ITEMS } from "@/lib/data";
import { GrayTitle, SectionLabel } from "@/components/custom/reusables";
import Image from "next/image";

export default async function InterviewerProfilePage({ params }) {
    const { id } = await params;
    const { has } = await auth();

    const user = await currentUser();
    if (!user) redirect("/");

    const dbUser = await db.user.findUnique({
        where: { clerkUserId: user.id },
        select: { role: true, credits: true },
    });

    if (!dbUser) redirect("/");
    if (dbUser.role === "UNASSIGNED") redirect("/onboarding");

    const interviewer = await getInterviewerProfile(id);

    const hasPro = has({ plan: "pro" });
    const hasStarter = has({ plan: "starter" });

    const plan = hasPro ? "PRO" : hasStarter ? "STARTER" : "FREE";

    if (!interviewer) notFound();

    return (
        <main className="min-h-screen bg-black">
            {/* ── Hero identity banner ── */}
            <section className="relative border-b border-white/8 overflow-hidden">
                <div className="absolute inset-0 z-[-1]">
                    <StarsBackgroundDemo />
                </div>

                <div className="relative max-w-6xl mx-auto px-8 py-20 flex flex-col gap-8">
                    <Link href="/explore">
                        <Button variant="link" className="text-stone-500 cursor-pointer">
                            <ArrowLeft size={13} />
                            Back to explore
                        </Button>
                    </Link>

                    <div className="flex items-start gap-8">
                        <Image
                            src={interviewer.imageUrl}
                            alt={interviewer.name}
                            height={100}
                            width={100}
                            className="rounded-xl h-36 w-36"
                        />
                        <div className="flex flex-col gap-3 min-w-0 pt-1">
                            <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-tight">
                                <GrayTitle>{interviewer.name}</GrayTitle>
                            </h1>

                            {interviewer.title && interviewer.company && (
                                <p className="text-base text-stone-400 font-light">
                                    {interviewer.title}
                                    <span className="text-stone-700 mx-2">·</span>
                                    {interviewer.company}
                                </p>
                            )}

                            <div className="flex items-center gap-2 flex-wrap mt-1">
                                {interviewer.yearsExp && (
                                    <Badge
                                        variant="outline"
                                        className="border-white/10 text-stone-400 text-xs px-3 py-1"
                                    >
                                        {interviewer.yearsExp}+ yrs experience
                                    </Badge>
                                )}
                                <Badge
                                    variant="outline"
                                    className="border-amber-400/25 bg-amber-400/8 text-amber-400 text-xs px-3 py-1"
                                >
                                    {interviewer.creditRate ?? 10} credits / session
                                </Badge>
                                {interviewer.availabilities?.[0] && (
                                    <Badge
                                        variant="outline"
                                        className="border-green-500/20 bg-green-500/8 text-green-400 text-xs px-3 py-1"
                                    >
                                        🟢 Available
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Body ── */}
            <div className="max-w-6xl mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
                {/* ── LEFT ── */}
                <div className="lg:col-span-3 flex flex-col gap-6 w-full">
                    {interviewer.bio && (
                        <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-8 flex flex-col gap-5">
                            <SectionLabel>About</SectionLabel>
                            <p className="text-base text-stone-300 font-light leading-relaxed">
                                {interviewer.bio}
                            </p>
                        </div>
                    )}

                    {interviewer.categories?.length > 0 && (
                        <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-8 flex flex-col gap-5">
                            <div>
                                <SectionLabel>Specialties</SectionLabel>
                                <p className="text-sm text-stone-500 font-light mt-1">
                                    Interview categories this expert covers.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                                {interviewer.categories.map((cat) => (
                                    <span
                                        key={cat}
                                        className="text-sm px-4 py-2 rounded-xl border border-amber-400/20 bg-amber-400/5 text-amber-400"
                                    >
                                        {CATEGORY_LABEL[cat] ?? cat}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-8 flex flex-col gap-6">
                        <div>
                            <SectionLabel>What to expect</SectionLabel>
                            <p className="text-sm text-stone-500 font-light mt-1">
                                Every session on Prept includes the following.
                            </p>
                        </div>
                        <ul className="flex flex-col gap-5">
                            {EXPECT_ITEMS
                                .filter((item) => item.plan === plan)
                                .flatMap((item) => item.features)
                                .map(([icon, title, desc]) => (
                                    <li key={title} className="flex items-start gap-4">
                                        <span className="mt-0.5 w-10 h-10 shrink-0 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-lg">
                                            {icon}
                                        </span>
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-sm font-medium text-stone-200">{title}</p>
                                            <p className="text-xs text-stone-500 font-light leading-relaxed">{desc}</p>
                                        </div>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                </div>

                {/* ── RIGHT — sticky slot picker ── */}
                <div className="lg:col-span-2 w-full">
                    <div className="lg:col-span-2 w-full">
                        <aside className="sticky top-24">
                            <SlotPicker
                                interviewer={interviewer}
                                interviewerCredits={interviewer.creditRate ?? 10}
                                userCredits={dbUser.credits}
                            />
                        </aside>
                    </div>
                </div>
            </div>
        </main>
    );
}