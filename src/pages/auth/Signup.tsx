import React, { useState } from 'react';
import {
  AuthPageShell,
  AuthPageHeader,
  AuthFormCard,
} from '../../components/auth/AuthPageLayout';
import SignupForm from '../../components/auth/SignupForm';
import AuthHeroRoleVideo from '../../components/auth/AuthHeroRoleVideo';
import { useAuth } from '../../context/AuthContext';
import { useFullPageLoading } from '../../hooks/useFullPageLoading';

const Signup: React.FC = () => {
  const { isLoading: isAuthLoading } = useAuth();
  const showFullPage = useFullPageLoading(isAuthLoading, false);
  const [accountType, setAccountType] = useState('Talent');

  return (
    <AuthPageShell
      loading={showFullPage}
      heroContent={<AuthHeroRoleVideo roleType={accountType} />}
    >
      <AuthPageHeader
        title="Start your Journey in Global health"
        subtitle="Join thousands of professionals shaping the future of public health."
      />

      <AuthFormCard>
        <SignupForm
          accountType={accountType}
          onAccountTypeChange={setAccountType}
        />
      </AuthFormCard>
    </AuthPageShell>
  );
};

export default Signup;
