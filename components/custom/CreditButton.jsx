"use client"
import React, { useState } from 'react'
import { Button } from '../ui/button';
import { Coins } from 'lucide-react';
import UpgradeModal from './UpgradeModal';

const CreditButton = ({ role, credits }) => {
    const [IsModalOpen, setIsModalOpen] = useState(false);

    const handleClick = () => {
        if (role === "INTERVIEWER") {
            window.location.href = "/dashboard";
        }
        else {
            setIsModalOpen(true);
        }
    }
    return (
        <>
            <Button
                className={"border-amber-400/20 text-amber-400"}
                variant="ghost"
                onClick={handleClick}
            >
                <Coins size={16} />
                {credits} {role === "INTERVIEWER" ? "Earned" : "Credits"}
            </Button>

            <UpgradeModal open={IsModalOpen} onOpenChange={setIsModalOpen} />
        </>
    )
}

export default CreditButton