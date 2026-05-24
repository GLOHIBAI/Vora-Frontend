import React from 'react';
import { ModalTitle } from './Typography';

interface ModalDialogProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

const ModalDialog: React.FC<ModalDialogProps> = ({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  maxWidth = 'max-w-[480px]',
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[700] flex items-center justify-center p-5 bg-black/45"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`bg-white rounded-2xl w-full ${maxWidth} shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="px-6 pt-5 pb-4 border-b border-[#E6E6E6]">
          <ModalTitle id="modal-title">{title}</ModalTitle>
          {subtitle && (
            <p className="text-[13px] text-[#808080] mt-1 leading-relaxed">{subtitle}</p>
          )}
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 pb-5">{footer}</div>}
      </div>
    </div>
  );
};

export default ModalDialog;
