// components/custom/WorkspacePlanBadge.jsx
"use client"
import UpgradeModal from '@/components/custom/UpgradeModal';
import { Button } from '@/components/ui/button';
import { Crown, User, Zap } from 'lucide-react';
import { useState } from 'react';
import CreateWorkSpaceModal from './CreateWorkSpaceModal';

const WorkspacePlanBadge = ({ plan, noOfFreeWorkspace, totalWrkspaces, user }) => {
  const [upgrade, setUpgrade] = useState(false);
  const [showCreateWrkSpModal, setShowCreateWrkSpModal] = useState(false);

  return (
    <>
      <div className='border border-amber-400/30 bg-amber-400/10 text-amber-300 py-3 px-5 rounded-xl flex flex-col items-center gap-1'>
        <span>
          {plan === "free" ? (
            <User size={30} />
          ) : plan === "starter" ? (
            <Zap size={30} />
          ) : (
            <Crown size={30} />
          )}
        </span>
        <span>
          {plan.toUpperCase()} - {noOfFreeWorkspace} / {totalWrkspaces}
        </span>
        
        {noOfFreeWorkspace >= totalWrkspaces ? (
          <Button variant='outline' size='sm' onClick={() => setUpgrade(true)}>
            Upgrade
          </Button>
        ) : (

          <Button variant='gold' size='sm' className={"my-2"} onClick={() => setShowCreateWrkSpModal(true)}>Create WorkSpace</Button>
        )
        }
      </div>

      <UpgradeModal open={upgrade} onOpenChange={setUpgrade} reason='WorkSpace Limit Reached' />
      <CreateWorkSpaceModal isOpen = {showCreateWrkSpModal} onClose={() => setShowCreateWrkSpModal(false)} canCreate = {noOfFreeWorkspace < totalWrkspaces} />
    </>
  );
};

export default WorkspacePlanBadge;