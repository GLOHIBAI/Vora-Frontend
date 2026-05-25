import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import {
  AuthPageShell,
  AuthPageHeader,
  AuthFormCard,
} from '../../components/auth/AuthPageLayout';
import { useOAuthSelectRoleMutation } from '../../services/queries/auth';
import { routeAfterAuth } from '../../utils/auth';
import { ROLE_LABELS } from '../../utils/oauth';
import { getSetupToken } from '../../utils/oauth';
import type { OAuthRole, SelectTypeLocationState } from '../../types';
import { useFullPageLoading } from '../../hooks/useFullPageLoading';

const SelectAccountType: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as SelectTypeLocationState) || {};
  const { email, allowedRoles = ['TALENT', 'MENTOR'] } = state;
  const isOAuthFlow = state.oauth || !!getSetupToken();

  const [accountType, setAccountType] = useState('');
  const selectRoleMutation = useOAuthSelectRoleMutation();

  useEffect(() => {
    if (isOAuthFlow && !getSetupToken()) {
      navigate('/login', { replace: true });
    }
  }, [isOAuthFlow, navigate]);

  const roleOptions = useMemo(
    () =>
      allowedRoles.map((role) => ({
        label: ROLE_LABELS[role],
        value: ROLE_LABELS[role],
      })),
    [allowedRoles],
  );

  const showFullPage = useFullPageLoading(
    selectRoleMutation.isPending,
    selectRoleMutation.isPending,
  );

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountType) return;

    const roleMap: Record<string, OAuthRole> = {
      Talent: 'TALENT',
      Mentor: 'MENTOR',
      Employer: 'EMPLOYER',
    };
    const role = roleMap[accountType];

    if (!role) return;

    try {
      const response = await selectRoleMutation.mutateAsync({ role });
      const user = response.data.user;

      if (user) {
        const targetRoute = routeAfterAuth(user);
        navigate(targetRoute, { state: { email: user.email || email, accountType: user.role } });
      } else {
        navigate('/dashboard');
      }
    } catch {
      // Error toast handled by api client
    }
  };

  return (
    <AuthPageShell loading={showFullPage}>
      <AuthPageHeader
        title="Choose your account type"
        subtitle={
          email ? (
            <>
              Select how you&apos;ll use Vora with{' '}
              <span className="break-all font-medium text-gray-900">{email}</span>
            </>
          ) : (
            <>Select how you&apos;ll use Vora</>
          )
        }
      />

      <AuthFormCard>
        <form onSubmit={handleContinue} className="space-y-8" autoComplete="off">
          <Select
            label="Account type"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            placeholder="Select account type"
            options={roleOptions}
          />

          <Button
            variant={accountType ? 'primary' : 'secondary'}
            type="submit"
            disabled={!accountType}
            isLoading={selectRoleMutation.isPending}
          >
            Continue
          </Button>
        </form>
      </AuthFormCard>
    </AuthPageShell>
  );
};

export default SelectAccountType;
