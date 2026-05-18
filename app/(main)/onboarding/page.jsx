"use client"

import { completeOnBoarding } from '@/actions/onboarding';
import { getCurrentUser } from '@/actions/user';
import { GoldTitle, GrayTitle, SectionLabel } from '@/components/custom/reusables';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import useFetch from '@/hooks/use-fetch';
import { CATEGORIES, ONBOARDING_ROLES, YEARS_OPTIONS } from '@/lib/data';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

// ─── Constants ───────────────────────────────────────────────────────────────

const INITIAL_FORM = {
    title: "",
    company: "",
    yearsExp: "",
    bio: "",
    categories: [],
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const PageHeader = () => (
    <div className="text-center mb-10">
        <SectionLabel>Welcome</SectionLabel>
        <h1 className="font-serif text-5xl leading-tight tracking-tighter mt-1">
            <GrayTitle>How will you be</GrayTitle>
            <br />
            <GoldTitle>using Prept?</GoldTitle>
        </h1>
        <p className="text-sm text-stone-500 font-light mt-4 leading-relaxed">
            This helps us personalise your experience.{" "}
            <span className="text-stone-600">You can&apos;t change this later.</span>
        </p>
    </div>
);

const OptionCard = ({ icon, title, description, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="text-left rounded-2xl p-8 border border-white/10 bg-[#0f0f11] hover:border-amber-400/20 hover:-translate-y-0.5 transition-all duration-300"
    >
        <span className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-xl mb-5">
            {icon}
        </span>
        <h3 className="text-sm text-stone-400 font-light leading-relaxed">{title}</h3>
        <p className="text-sm text-stone-400 font-light leading-relaxed">{description}</p>
    </button>
);

const PillButton = ({ active, onClick, children }) => (
    <button
        type="button"
        onClick={onClick}
        className={`text-xs px-4 py-2 rounded-lg border transition-colors ${
            active
                ? "border-amber-400/40 bg-amber-400/10 text-amber-400"
                : "border-white/10 text-stone-500"
        }`}
    >
        {children}
    </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const OnboardingPage = () => {
    const router = useRouter();

    const { data, loading: isCompleting, fn: onBoardingFn } = useFetch(completeOnBoarding);

    const [step, setStep] = useState("WORKSPACE"); // "WORKSPACE" | "ROLE" | role value
    const [user, setUser] = useState(null);
    const [form, setForm] = useState(INITIAL_FORM);

    const role = ONBOARDING_ROLES.find((r) => r.value === step) ? step : null;

    useEffect(() => {
        getCurrentUser().then(setUser);
    }, [data]);

    // ── Derived state ──
    const isInterviewerValid =
        form.title.trim() &&
        form.company.trim() &&
        form.yearsExp &&
        form.bio.trim() &&
        form.categories.length > 0;

    const canSubmit = role === "INTERVIEWEE" || (role === "INTERVIEWER" && isInterviewerValid);

    // ── Handlers ──
    const handleReset = () => {
        setStep("WORKSPACE");
        setForm(INITIAL_FORM);
    };

    const toggleCategory = (val) =>
        setForm((prev) => ({
            ...prev,
            categories: prev.categories.includes(val)
                ? prev.categories.filter((c) => c !== val)
                : [...prev.categories, val],
        }));

    const handleSubmit = () => {
        if (!canSubmit) return;
        onBoardingFn({
            role,
            ...(role === "INTERVIEWER" && {
                title: form.title,
                company: form.company,
                yearsExp: Number(form.yearsExp),
                bio: form.bio,
                categories: form.categories,
            }),
        });
        router.refresh("/onboarding")
    };

    // ── Loading ──
    if (!user) return <div>Loading...</div>;

    // ── Already onboarded — show destination picker ──
    const isOnboarded = user.role === "INTERVIEWER" || user.role === "INTERVIEWEE";
    if (isOnboarded) {
        return (
            <div className="min-h-screen px-6 py-10 flex flex-col items-center">
                <div className="w-full max-w-2xl">
                    <PageHeader />
                    <div className="grid grid-cols-2 gap-4">
                        <OptionCard
                            icon="💼"
                            title="WORKSPACE"
                            description="Create and manage your workspaces, projects and tasks."
                            onClick={() => router.push("/workspace")}
                        />
                        <OptionCard
                            icon="👨‍💼"
                            title={user.role === "INTERVIEWER" ? "GoTo Dashboard" : "Explore Interviewers"}
                            description="Share your expertise, or learn from interviewers, and help engineers level up."
                            onClick={() => router.push(user.role === "INTERVIEWER" ? "/dashboard" : "/explore")}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // ── New user onboarding flow ──
    return (
        <div className="min-h-screen px-6 py-10 flex flex-col items-center">
            <div className="w-full max-w-2xl">
                <PageHeader />

                {/* Step 1: Workspace vs Interview */}
                {step === "WORKSPACE" && (
                    <div className="grid grid-cols-2 gap-4">
                        <OptionCard
                            icon="💼"
                            title="WORKSPACE"
                            description="Create and manage your workspaces, projects and tasks."
                            onClick={() => router.push("/workspace")}
                        />
                        <OptionCard
                            icon="👨‍💼"
                            title="INTERVIEW"
                            description="Share your expertise, or learn from interviewers, and help engineers level up."
                            onClick={() => setStep("ROLE")}
                        />
                    </div>
                )}

                {/* Step 2: Pick a role */}
                {step === "ROLE" && (
                    <>
                        <Button variant="outline" size="lg" onClick={handleReset} className="mb-4 w-full">
                            Change
                        </Button>
                        <div className="grid grid-cols-2 gap-4">
                            {ONBOARDING_ROLES.map((r) => (
                                <button
                                    key={r.value}
                                    type="button"
                                    onClick={() => setStep(r.value)}
                                    className="text-left rounded-2xl p-8 border border-white/10 bg-[#0f0f11] hover:border-amber-400/20 hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    <span className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-xl mb-5">
                                        {r.icon}
                                    </span>
                                    <h3 className="font-serif text-xl tracking-tight mb-3 text-stone-100">{r.title}</h3>
                                    <p className="text-sm text-stone-400 font-light leading-relaxed">{r.desc}</p>
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* Step 3: Role selected — show form if interviewer */}
                {role && (
                    <div className="flex flex-col gap-6">
                        {/* Selected role badge */}
                        <div className="flex items-center justify-between bg-[#0f0f11] border border-white/10 rounded-2xl px-6 py-4">
                            <div className="flex items-center gap-3">
                                <span className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-base shrink-0">
                                    {ONBOARDING_ROLES.find((r) => r.value === role)?.icon}
                                </span>
                                <div>
                                    <p className="text-sm text-stone-400 font-medium">
                                        {ONBOARDING_ROLES.find((r) => r.value === role)?.title}
                                    </p>
                                    <p className="text-xs text-stone-600 mt-0.5">Selected Role</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleReset}>Change</Button>
                        </div>

                        {/* Interviewer profile form */}
                        {role === "INTERVIEWER" && (
                            <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-8 flex flex-col gap-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="title">Current Title</Label>
                                        <Input
                                            id="title"
                                            placeholder="Senior Software Engineer"
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="company">Company</Label>
                                        <Input
                                            id="company"
                                            placeholder="Google, Meta, Startup"
                                            value={form.company}
                                            onChange={(e) => setForm({ ...form, company: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {YEARS_OPTIONS.map((opt) => (
                                        <PillButton
                                            key={opt.value}
                                            active={form.yearsExp === opt.value}
                                            onClick={() => setForm({ ...form, yearsExp: opt.value })}
                                        >
                                            {opt.label}
                                        </PillButton>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.filter((cat) => cat.value).map((cat) => (
                                        <PillButton
                                            key={cat.value}
                                            active={form.categories.includes(cat.value)}
                                            onClick={() => toggleCategory(cat.value)}
                                        >
                                            {cat.label}
                                        </PillButton>
                                    ))}
                                </div>

                                <Textarea
                                    rows={4}
                                    maxLength={300}
                                    placeholder="Tell interviewers about your background, what you specialize in, and what they can expect from a session with you."
                                    value={form.bio}
                                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                                />
                            </div>
                        )}

                        <Button
                            variant="gold"
                            size="hero"
                            className="w-full"
                            disabled={isCompleting || !canSubmit}
                            onClick={handleSubmit}
                        >
                            {isCompleting
                                ? "Setting up your account..."
                                : role === "INTERVIEWER"
                                    ? "Create interviewer profile →"
                                    : "Explore Interviewers →"}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OnboardingPage;