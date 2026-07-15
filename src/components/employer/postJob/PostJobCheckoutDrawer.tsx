import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../services/api';
import AlertBanner from '../../common/AlertBanner';
import { CardTitle, DrawerTitle } from '../../common/Typography';
import { CloseIcon } from '../../common/Icons';
import type { EscrowPreviewSummary } from './PostJobPreviewStep';

interface PaymentConfig {
  mode: string;
  providersConfigured: boolean;
  checkoutRequired: boolean;
  collectionOptions: any[];
  devBypassNotice?: string;
}

interface PostJobCheckoutDrawerProps {
  isOpen: boolean;
  isScheduled: boolean;
  roleTitle: string;
  escrow: EscrowPreviewSummary;
  fmt: (value: number, currency: string) => string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const PostJobCheckoutDrawer: React.FC<PostJobCheckoutDrawerProps> = ({
  isOpen,
  isScheduled,
  roleTitle,
  escrow,
  fmt,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingConfig(true);
      apiClient.get({ url: `/payments/employer/config?currency=${escrow.currency}` })
        .then((res: any) => setPaymentConfig(res?.data || res))
        .catch(() => {
          // On error, we fallback to requiring checkout to be safe
          setPaymentConfig(null);
        })
        .finally(() => setIsLoadingConfig(false));
    } else {
      setPaymentConfig(null);
      setIsLoadingConfig(true);
    }
  }, [isOpen, escrow.currency]);

  if (!isOpen) return null;

  const totalLabel = fmt(escrow.total, escrow.currency);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/45 z-[700]"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`fixed top-0 right-0 bottom-0 w-full max-w-[520px] bg-white shadow-[-8px_0_32px_rgba(0,0,0,0.12)] z-[800] flex flex-col transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal
        aria-labelledby="checkout-title"
      >
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#E6E6E6] shrink-0">
          <DrawerTitle id="checkout-title">
            {isScheduled ? 'Checkout, Vault Submission' : 'Checkout'}
          </DrawerTitle>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#808080] hover:bg-[#F7F7F7] hover:text-[#1A1A1A] cursor-pointer"
            aria-label="Close checkout"
          >
            <CloseIcon size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-6">
          <div className="mb-5">
            <CardTitle className="text-base mb-3">Summary</CardTitle>
            <div className="bg-[#F7F7F7] rounded-[10px] px-4 py-3 space-y-0">
              <div className="flex justify-between gap-4 py-2 border-b border-[#E6E6E6] text-[13px]">
                <span className="text-[#808080]">Role</span>
                <span className="font-medium text-[#1A1A1A] text-right max-w-[240px]">{roleTitle || ','}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E6E6E6] text-[13px]">
                <span className="text-[#808080]">Available positions</span>
                <span className="font-medium text-[#1A1A1A]">
                  {escrow.positions} position{escrow.positions > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E6E6E6] text-[13px]">
                <span className="text-[#808080]">Salary midpoint</span>
                <span className="font-medium text-[#1A1A1A]">{fmt(escrow.midpoint, escrow.currency)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E6E6E6] text-[13px]">
                <span className="text-[#808080]">VORA fee rate</span>
                <span className="font-medium text-[#1A1A1A]">{escrow.rateLabel}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E6E6E6] text-[13px]">
                <span className="text-[#808080]">Platform fee (per position)</span>
                <span className="font-medium text-[#1A1A1A]">{fmt(escrow.perPosition, escrow.currency)}</span>
              </div>
              <div className="flex justify-between pt-3 text-[15px]">
                <span className="font-semibold text-[#1A1A1A]">Total escrow locked today</span>
                <span className="font-semibold text-[#0047CC]">{totalLabel}</span>
              </div>
            </div>
            <p className="text-[12px] text-[#808080] leading-relaxed mt-3">
              {isScheduled
                ? 'Your role enters Vault state immediately on payment. Pre-qualified candidates are notified when your role goes live. Cancel any time before 24 hours of go-live for a full refund.'
                : 'This amount is locked in escrow at submission. A true-up adjustment fires within 24 hours of hire confirmation based on the declared final salary.'}
            </p>
          </div>

          {isScheduled ? (
            <AlertBanner variant="blue" className="mb-5 !text-[12px]">
              <strong>Vault mode, fee locked at today&apos;s rate.</strong> Your role is invisible until
              go-live. VORA silently matches new candidates during the vault period.
            </AlertBanner>
          ) : (
            <AlertBanner variant="blue" className="mb-5 !text-[12px]">
              <strong>How escrow works for this role.</strong> You pay <strong>{totalLabel}</strong> today
              (locked in escrow). On hire confirmation, VORA calculates the exact fee owed and charges or
              refunds the difference automatically.
            </AlertBanner>
          )}

          {paymentConfig?.devBypassNotice && paymentConfig.mode === 'stub' && (
            <AlertBanner variant="amber" className="mb-5 !text-[12px] bg-white">
              {paymentConfig.devBypassNotice}
            </AlertBanner>
          )}

          {isLoadingConfig ? (
            <div className="py-6 text-center text-[13px] text-[#808080]">Loading payment options…</div>
          ) : paymentConfig?.checkoutRequired === false ? (
            <div className="py-2 text-[13px] text-[#4A4A4A]">
              Payment details are not required at this time. You can proceed directly to submit the role.
            </div>
          ) : (
            <div>
              <CardTitle className="text-base mb-2">Payment options</CardTitle>
              <p className="text-[13px] text-[#808080] mb-3">Select your preferred payment method</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {[
                  { id: 'card', label: 'Credit / Debit' },
                  { id: 'paypal', label: 'PayPal' },
                  { id: 'apple', label: 'Apple Pay' },
                  { id: 'google', label: 'Google Pay' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`rounded-[10px] border-2 py-3 px-2 text-[11px] font-bold transition-colors cursor-pointer ${
                      paymentMethod === m.id
                        ? 'border-[#0047CC] bg-white text-[#0047CC]'
                        : 'border-[#E6E6E6] text-[#4A4A4A] hover:border-[#387DFF]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-3">
                  <p className="text-[13px] font-bold text-[#1A1A1A]">Payment details</p>
                  <input autoComplete="off"
                    className="w-full px-3.5 py-2.5 border border-[#E6E6E6] rounded-lg text-sm outline-none focus:border-[#0047CC]"
                    placeholder="Cardholder's name"
                  />
                  <input autoComplete="off"
                    className="w-full px-3.5 py-2.5 border border-[#E6E6E6] rounded-lg text-sm outline-none focus:border-[#0047CC]"
                    placeholder="0000 0000 0000 0000"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input autoComplete="off"
                      className="w-full px-3.5 py-2.5 border border-[#E6E6E6] rounded-lg text-sm outline-none focus:border-[#0047CC]"
                      placeholder="MM / YYYY"
                    />
                    <input autoComplete="off"
                      className="w-full px-3.5 py-2.5 border border-[#E6E6E6] rounded-lg text-sm outline-none focus:border-[#0047CC]"
                      placeholder="CVV"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-[#E6E6E6] px-7 py-4 grid grid-cols-2 gap-3 bg-white">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-[#E6E6E6] py-3 text-sm font-bold text-[#4A4A4A] hover:border-[#ADADAD] cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || isLoadingConfig}
            className="rounded-xl bg-[#0047CC] hover:bg-[#344DA1] py-3 text-sm font-bold text-white cursor-pointer disabled:opacity-60 whitespace-nowrap"
          >
            {isSubmitting
              ? 'Processing…'
              : paymentConfig?.checkoutRequired === false
                ? 'Submit role'
                : isScheduled
                  ? `Lock in Escrow, ${totalLabel}`
                  : `Pay ${totalLabel}`}
          </button>
        </div>
      </div>
    </>
  );
};

export default PostJobCheckoutDrawer;
