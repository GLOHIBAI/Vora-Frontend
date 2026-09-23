import React, { useCallback } from 'react';
import toast from 'react-hot-toast';
import AlertBanner from '../../common/AlertBanner';
import Button from '../../common/Button';
import Input from '../../common/Input';
import Select from '../../common/Select';
import {
  STRIPE_PAYOUT_CURRENCIES,
  WITHDRAW_BANK_COUNTRIES,
} from '../../../constants/withdrawWallet';
import {
  validateWithdrawBankAccount,
  validateWithdrawStripeAccount,
} from '../../../utils/paymentFormValidation';
import { useValidatedForm } from '../../../hooks/useValidatedForm';
import type { WithdrawMethod } from '../../../types/withdrawWallet';

interface WithdrawStepAccountProps {
  method: WithdrawMethod;
  onContinue: () => void;
}

const STRIPE_INITIAL = {
  stripeEmail: '',
  payoutCurrency: 'USD',
};

const BANK_INITIAL = {
  accountHolderName: '',
  bankName: '',
  accountNumber: '',
  sortCode: '',
  swiftBic: '',
  country: '',
};

const WithdrawStepAccount: React.FC<WithdrawStepAccountProps> = ({ method, onContinue }) => {
  const validateStripe = useCallback(
    (values: typeof STRIPE_INITIAL) => validateWithdrawStripeAccount(values),
    [],
  );
  const validateBank = useCallback(
    (values: typeof BANK_INITIAL) => validateWithdrawBankAccount(values),
    [],
  );

  const stripeForm = useValidatedForm(STRIPE_INITIAL, validateStripe);
  const bankForm = useValidatedForm(BANK_INITIAL, validateBank);

  const handleContinue = () => {
    const valid = method === 'stripe' ? stripeForm.validateAll() : bankForm.validateAll();
    if (!valid) {
      toast.error('Please complete all required fields correctly.');
      return;
    }
    onContinue();
  };

  if (method === 'stripe') {
    return (
      <>
        <AlertBanner variant="blue" className="!text-xs mb-5">
          Stripe will send funds to your registered payout account. Ensure your Stripe dashboard is
          configured for payouts.
        </AlertBanner>
        <Input
          label="Stripe Account Email"
          type="email"
          placeholder="stripe@yourdomain.com"
          value={stripeForm.values.stripeEmail}
          onChange={(e) => stripeForm.setField('stripeEmail', e.target.value)}
          onBlur={() => stripeForm.markTouched('stripeEmail')}
          error={stripeForm.fieldError('stripeEmail')}
          helperText={stripeForm.showError('stripeEmail')}
        />
        <Select
          label="Payout Currency"
          value={stripeForm.values.payoutCurrency}
          onChange={(e) => stripeForm.setField('payoutCurrency', e.target.value)}
          onBlur={() => stripeForm.markTouched('payoutCurrency')}
          options={STRIPE_PAYOUT_CURRENCIES.map((c) => ({ label: c, value: c }))}
          error={stripeForm.fieldError('payoutCurrency')}
          helperText={stripeForm.showError('payoutCurrency')}
        />
        <Button variant="primary" pill={false} className="!rounded-lg gap-2 mt-6" onClick={handleContinue}>
          Review Withdrawal
        </Button>
      </>
    );
  }

  return (
    <>
      <Input
        label="Account Holder Name"
        placeholder="Full name on bank account"
        value={bankForm.values.accountHolderName}
        onChange={(e) => bankForm.setField('accountHolderName', e.target.value)}
        onBlur={() => bankForm.markTouched('accountHolderName')}
        error={bankForm.fieldError('accountHolderName')}
        helperText={bankForm.showError('accountHolderName')}
      />
      <Input
        label="Bank Name"
        placeholder="e.g. Access Bank, Barclays, Chase"
        value={bankForm.values.bankName}
        onChange={(e) => bankForm.setField('bankName', e.target.value)}
        onBlur={() => bankForm.markTouched('bankName')}
        error={bankForm.fieldError('bankName')}
        helperText={bankForm.showError('bankName')}
      />
      <Input
        label="Account Number / IBAN"
        placeholder="e.g. GB29NWBK60161331926819"
        value={bankForm.values.accountNumber}
        onChange={(e) => bankForm.setField('accountNumber', e.target.value)}
        onBlur={() => bankForm.markTouched('accountNumber')}
        error={bankForm.fieldError('accountNumber')}
        helperText={bankForm.showError('accountNumber')}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-[18px]">
        <Input
          label="Sort Code / Routing"
          placeholder="00-00-00"
          value={bankForm.values.sortCode}
          onChange={(e) => bankForm.setField('sortCode', e.target.value)}
          onBlur={() => bankForm.markTouched('sortCode')}
          error={bankForm.fieldError('sortCode')}
          helperText={bankForm.showError('sortCode')}
        />
        <Input
          label="SWIFT / BIC"
          placeholder="e.g. AAAABBCC"
          value={bankForm.values.swiftBic}
          onChange={(e) => bankForm.setField('swiftBic', e.target.value.toUpperCase())}
          onBlur={() => bankForm.markTouched('swiftBic')}
          error={bankForm.fieldError('swiftBic')}
          helperText={bankForm.showError('swiftBic')}
        />
      </div>
      <Select
        label="Bank Country"
        placeholder="Select country"
        value={bankForm.values.country}
        onChange={(e) => bankForm.setField('country', e.target.value)}
        onBlur={() => bankForm.markTouched('country')}
        options={WITHDRAW_BANK_COUNTRIES.map((c) => ({ label: c, value: c }))}
        error={bankForm.fieldError('country')}
        helperText={bankForm.showError('country')}
      />
      <Button variant="primary" pill={false} className="!rounded-lg gap-2 mt-6" onClick={handleContinue}>
        Review Withdrawal
      </Button>
    </>
  );
};

export default WithdrawStepAccount;
