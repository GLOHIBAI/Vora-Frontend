import React, { useCallback } from 'react';
import toast from 'react-hot-toast';
import AlertBanner from '../../common/AlertBanner';
import Button from '../../common/Button';
import Input from '../../common/Input';
import Select from '../../common/Select';
import TopUpAmountField from '../TopUpAmountField';
import TopUpSecurityNote from '../TopUpSecurityNote';
import FormFieldShell, { formControlClass } from '../methods/FormFieldShell';
import { LockIcon } from '../../common/Icons';
import { STRIPE_BILLING_COUNTRIES, TOP_UP_AMOUNT_PRESETS } from '../../../constants/topUpWallet';
import { formatCardExpiry, formatCardNumber } from '../../../utils/topUpWallet';
import { validateStripeCardForm } from '../../../utils/paymentFormValidation';
import { useValidatedForm } from '../../../hooks/useValidatedForm';

interface StripeTopUpPanelProps {
  amount: string;
  onAmountChange: (value: string) => void;
  activePreset: number | null;
  onPresetSelect: (amount: number) => void;
  onSubmit: () => void;
}

const CARD_INITIAL = {
  cardholderName: '',
  cardNumber: '',
  expiry: '',
  cvc: '',
  country: '',
};

const StripeTopUpPanel: React.FC<StripeTopUpPanelProps> = ({
  amount,
  onAmountChange,
  activePreset,
  onPresetSelect,
  onSubmit,
}) => {
  const validate = useCallback((values: typeof CARD_INITIAL) => validateStripeCardForm(values), []);
  const form = useValidatedForm(CARD_INITIAL, validate);

  const handlePay = () => {
    if (!form.validateAll()) {
      toast.error('Please complete all card details correctly.');
      return;
    }
    onSubmit();
  };

  return (
    <div>
      <AlertBanner variant="blue" className="!text-xs mb-5">
        Payments are processed securely by <strong>Stripe</strong>. Your card details are encrypted and
        never stored on VORA servers.
      </AlertBanner>

      <TopUpAmountField
        value={amount}
        onChange={onAmountChange}
        presets={TOP_UP_AMOUNT_PRESETS}
        activePreset={activePreset}
        onPresetSelect={onPresetSelect}
      />

      <Input
        label="Cardholder Name"
        placeholder="Name as it appears on your card"
        value={form.values.cardholderName}
        onChange={(e) => form.setField('cardholderName', e.target.value)}
        onBlur={() => form.markTouched('cardholderName')}
        error={form.fieldError('cardholderName')}
        helperText={form.showError('cardholderName')}
      />
      <FormFieldShell
        label="Card Number"
        error={form.fieldError('cardNumber')}
        helperText={form.showError('cardNumber')}
      >
        <input
          type="text"
          value={form.values.cardNumber}
          maxLength={19}
          placeholder="1234 5678 9012 3456"
          onChange={(e) => form.setField('cardNumber', formatCardNumber(e.target.value))}
          onBlur={() => form.markTouched('cardNumber')}
          className={`${formControlClass(form.fieldError('cardNumber'))} tracking-wide`}
        />
      </FormFieldShell>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-[18px]">
        <Input
          label="Expiry Date"
          placeholder="MM / YY"
          value={form.values.expiry}
          maxLength={7}
          onChange={(e) => form.setField('expiry', formatCardExpiry(e.target.value))}
          onBlur={() => form.markTouched('expiry')}
          error={form.fieldError('expiry')}
          helperText={form.showError('expiry')}
        />
        <Input
          label="CVC / CVV"
          placeholder="•••"
          maxLength={4}
          value={form.values.cvc}
          onChange={(e) => form.setField('cvc', e.target.value.replace(/\D/g, '').slice(0, 4))}
          onBlur={() => form.markTouched('cvc')}
          error={form.fieldError('cvc')}
          helperText={form.showError('cvc')}
        />
      </div>

      <Select
        label="Billing Country"
        placeholder="Select your country"
        value={form.values.country}
        onChange={(e) => form.setField('country', e.target.value)}
        onBlur={() => form.markTouched('country')}
        options={STRIPE_BILLING_COUNTRIES.map((c) => ({ label: c, value: c }))}
        error={form.fieldError('country')}
        helperText={form.showError('country')}
        containerClassName="mb-[18px]"
      />

      <Button
        variant="primary"
        pill={false}
        className="!rounded-lg !text-sm gap-2"
        onClick={handlePay}
      >
        <LockIcon size={15} strokeWidth={2.5} />
        Pay Securely via Stripe
      </Button>
      <TopUpSecurityNote>
        256-bit SSL encryption · PCI DSS compliant · Powered by Stripe
      </TopUpSecurityNote>
    </div>
  );
};

export default StripeTopUpPanel;
