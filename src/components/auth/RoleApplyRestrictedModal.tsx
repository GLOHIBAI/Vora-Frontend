import React from 'react';
import ModalDialog from '../common/ModalDialog';
import Button from '../common/Button';
import { InfoIcon } from '../common/Icons';

interface RoleApplyRestrictedModalProps {
  open: boolean;
  accountType: string;
  onContinue: () => void;
}

const RoleApplyRestrictedModal: React.FC<RoleApplyRestrictedModalProps> = ({
  open,
  accountType,
  onContinue,
}) => {
  const roleName = accountType.toUpperCase() === 'EMPLOYER' ? 'Employers' : 'Mentors';
  
  return (
    <ModalDialog
      open={open}
      title={
        <div className="text-center w-full">Notice</div>
      }
      subtitle={
        <div className="text-center w-full mt-1.5">{roleName} cannot apply for roles.</div>
      }
      onClose={onContinue}
      footer={
        <div className="w-full pt-2">
          <Button variant="primary" pill={false} className="rounded-xl" onClick={onContinue} fullWidth>
            Got it
          </Button>
        </div>
      }
    >
      <div className="text-[13.5px] text-[#4A4A4A] leading-relaxed text-center">
        You have logged in with an {roleName.toLowerCase().slice(0, -1)} account. 
        Only Talent accounts are eligible to apply for roles. You will now be redirected to your dashboard.
      </div>
    </ModalDialog>
  );
};

export default RoleApplyRestrictedModal;
