import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MonitorSmartphone } from "lucide-react";
import { GrayTitle, GoldTitle } from "@/components/custom/reusables";

export default function DesktopOnlyCard() {
    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-md bg-[#141417]/90 border border-white/10 shadow-2xl p-8 text-center">
                <CardContent className="flex flex-col items-center justify-center space-y-6 pt-6">
                    <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-2">
                        <MonitorSmartphone className="text-amber-400" size={32} />
                    </div>
                    <h2 className="font-serif text-3xl tracking-tight leading-snug">
                        <GrayTitle>Switch to</GrayTitle> <br /><GoldTitle>Desktop</GoldTitle>
                    </h2>
                    <p className="text-stone-400 text-sm leading-relaxed">
                        This view is optimized for larger screens. For the best experience, please switch to a desktop or laptop device.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
