import React from 'react';
import { ModalTitle } from './Typography';

interface ModalDialogProps {
  open?: boolean;
  isOpen?: boolean;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: string;
}

const ModalDialog: React.FC<ModalDialogProps> = ({
  open,
  isOpen,
  title,
  subtitle,
  onClose,
  children,
  footer,
  actions,
  maxWidth = 'max-w-[480px]',
}) => {
  const isVisible = open ?? isOpen ?? false;
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[700] flex items-center justify-center p-3 sm:p-5 bg-black/45 overflow-y-auto"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`bg-white rounded-2xl w-full ${maxWidth} shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden max-h-[92vh] flex flex-col my-auto`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-[#E6E6E6] shrink-0">
          <ModalTitle id="modal-title">{title}</ModalTitle>
        </div>
        <div className="overflow-y-auto flex-1 min-h-0">
          {subtitle && (
            <p className="px-5 sm:px-6 text-sm sm:text-base text-black my-3 sm:my-4 leading-relaxed font-bold">{subtitle}</p>
          )}
          <div className="px-5 sm:px-6 pb-5">{children}</div>
        </div>
        {(footer || actions) && (
          <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-[#F7F7F7] shrink-0">
            {footer || actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalDialog;
