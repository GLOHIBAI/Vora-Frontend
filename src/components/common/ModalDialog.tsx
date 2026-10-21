import React, { useEffect } from 'react';
import { ModalTitle } from './Typography';
import { CloseIcon, TrashIcon } from './Icons';
import Spinner from './Spinner';

export interface ModalDialogProps {
  open?: boolean;
  isOpen?: boolean;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: string;
  className?: string;
  containerClassName?: string;
  hideHeaderBorder?: boolean;
  hideFooterBorder?: boolean;
  showCloseButton?: boolean;
  customHeader?: React.ReactNode;
  dismissOnEscape?: boolean;
}

export interface ConsequenceItem {
  lead?: string;
  text: string;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  subtitle?: string;
  variant?: 'danger' | 'warning' | 'neutral';
  icon?: React.ReactNode;
  contextCard?: React.ReactNode;
  consequencesTitle?: string;
  consequences?: Array<ConsequenceItem | string>;
  confirmText?: string;
  confirmLoadingText?: string;
  cancelText?: string;
  isLoading?: boolean;
  maxWidth?: string;
  children?: React.ReactNode;
}

/**
 * Specialized confirmation / alert dialog that consumes ModalDialog:
 * - Color discipline: Red is reserved exclusively for the danger icon & confirm button.
 * - Neutral gray boxes for context and consequence summaries.
 * - Single consistent 16px neutral icon set for bullet points.
 * - 20px semibold title, 14px slate-500 subtitle, 14px slate-600 body copy.
 * - 24px container padding, 16px gaps between sections, shared radii and borders.
 * - Equal height 44px buttons, mobile full-width stacking.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle,
  variant = 'danger',
  icon,
  contextCard,
  consequencesTitle = 'What will happen',
  consequences,
  confirmText = 'Delete Course',
  confirmLoadingText = 'Deleting…',
  cancelText = 'Cancel',
  isLoading = false,
  maxWidth = 'max-w-lg',
  children,
}) => {
  const isDanger = variant === 'danger';

  const renderIcon = () => {
    if (icon) return icon;
    if (isDanger) {
      return (
        <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
          <TrashIcon size={20} />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
        <TrashIcon size={20} />
      </div>
    );
  };

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={() => !isLoading && onClose()}
      maxWidth={maxWidth}
      dismissOnEscape={!isLoading}
      customHeader={
        <div className="p-6 pb-0 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            {renderIcon()}
            <div className="pt-0.5 min-w-0">
              <h3 id="modal-title" className="text-[20px] font-semibold text-slate-900 leading-snug">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-slate-500 mt-1 leading-normal">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="p-1.5 -mr-1.5 -mt-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-40 focus:outline-hidden focus:ring-2 focus:ring-slate-300"
            aria-label="Close dialog"
          >
            <CloseIcon size={16} />
          </button>
        </div>
      }
      hideFooterBorder={true}
      footer={
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-0">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="w-full sm:w-auto h-11 px-5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 transition-colors disabled:opacity-50 cursor-pointer inline-flex items-center justify-center"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`w-full sm:w-auto h-11 px-5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-offset-2 ${
              isDanger
                ? 'text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 focus:ring-rose-500'
                : 'text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 focus:ring-slate-700'
            }`}
          >
            {isLoading ? (
              <>
                <Spinner size={16} className="text-white border-white/20 border-t-white" />
                <span>{confirmLoadingText}</span>
              </>
            ) : (
              <>
                {isDanger && <TrashIcon size={16} />}
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      }
    >
      <div className="space-y-4 pt-4">
        {/* Optional Context Card (e.g. Course summary) */}
        {contextCard}

        {/* Optional Consequences list */}
        {consequences && consequences.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            {consequencesTitle && (
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                {consequencesTitle}
              </h4>
            )}
            <ul className="space-y-2.5">
              {consequences.map((item, index) => {
                const isObject = typeof item === 'object';
                const lead = isObject ? item.lead : null;
                const text = isObject ? item.text : item;

                return (
                  <li key={index} className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed">
                    <svg
                      className="w-4 h-4 text-slate-400 shrink-0 mt-1"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle cx="8" cy="8" r="3" fill="currentColor" />
                    </svg>
                    <span>
                      {lead && <strong className="font-semibold text-slate-900">{lead} </strong>}
                      {text}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {children}
      </div>
    </ModalDialog>
  );
};

/**
 * Generic ModalDialog component used across all app dashboards.
 * Preserves full backwards compatibility with all existing screens.
 */
interface ModalDialogComponent extends React.FC<ModalDialogProps> {
  Confirm: React.FC<ConfirmDialogProps>;
}

const ModalDialog: ModalDialogComponent = Object.assign(
  ({
    open,
    isOpen,
    title,
    subtitle,
    onClose,
    children,
    footer,
    actions,
    maxWidth = 'max-w-[480px]',
    className = '',
    containerClassName = '',
    hideHeaderBorder = false,
    hideFooterBorder = false,
    showCloseButton = false,
    customHeader,
    dismissOnEscape = true,
  }: ModalDialogProps) => {
    const isVisible = open ?? isOpen ?? false;

    useEffect(() => {
      if (!isVisible || !dismissOnEscape) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isVisible, dismissOnEscape, onClose]);

    if (!isVisible) return null;

    // Guard against max-w-* classes accidentally passed in className targeting the modal card instead of the backdrop
    const classes = className.split(' ').filter(Boolean);
    const backdropClasses = classes.filter((c) => !c.startsWith('max-w-')).join(' ');
    const cardMaxWidthFromClass = classes.find((c) => c.startsWith('max-w-'));
    const effectiveMaxWidth = cardMaxWidthFromClass || maxWidth;

    return (
      <div
        className={`fixed inset-0 z-[700] flex items-center justify-center p-3 sm:p-5 bg-black/45 overflow-y-auto ${backdropClasses}`}
        onClick={onClose}
        role="presentation"
      >
        <div
          className={`bg-white rounded-2xl w-full ${effectiveMaxWidth} shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden max-h-[92vh] flex flex-col my-auto relative ${containerClassName}`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {customHeader ? (
            customHeader
          ) : title ? (
            <div className={`px-5 sm:px-6 pt-5 pb-4 ${hideHeaderBorder ? '' : 'border-b border-[#E6E6E6]'} shrink-0 flex items-start justify-between gap-4`}>
              <div className="min-w-0 flex-1">
                <ModalTitle id="modal-title">{title}</ModalTitle>
              </div>
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 -mr-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <CloseIcon size={16} />
                </button>
              )}
            </div>
          ) : null}

          <div className="overflow-y-auto flex-1 min-h-0">
            {subtitle && (
              <p className="px-5 sm:px-6 text-sm sm:text-base text-black my-3 sm:my-4 leading-relaxed font-bold">{subtitle}</p>
            )}
            <div className="px-5 sm:px-6 pb-5">{children}</div>
          </div>

          {(footer || actions) && (
            <div className={`px-5 sm:px-6 pb-5 pt-3 ${hideFooterBorder ? '' : 'border-t border-[#F7F7F7]'} shrink-0`}>
              {footer || actions}
            </div>
          )}
        </div>
      </div>
    );
  },
  {
    Confirm: ConfirmDialog,
  }
);

export default ModalDialog;
