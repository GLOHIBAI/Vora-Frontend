import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';

const SelectAccountType: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || { email: 'user@social.com' };
  const [accountType, setAccountType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountType) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (accountType === 'Talent') {
        navigate('/onboarding/talent', { state: { email, firstName: 'Social User' } });
      } else {
        navigate('/onboarding/mentor-apply', { state: { email, firstName: 'Social User' } });
      }
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-[480px] bg-white rounded-2xl p-0 sm:p-4">
        <form onSubmit={handleContinue} className="space-y-8">
          <Select 
            label="Account type"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            placeholder="Select account type"
            options={[
              { label: 'Talent', value: 'Talent' },
              { label: 'Mentor', value: 'Mentor' },
            ]}
          />

          <Button 
            variant={accountType ? 'primary' : 'secondary'}
            type="submit"
            disabled={!accountType}
            isLoading={isLoading}
          >
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SelectAccountType;
