import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useMentorOnboardingStateQuery } from '../../services/queries/onboarding';
import {
  getMentorOnboardingProceedRoute,
  getMentorOnboardingProfileStep,
  isMentorOnboardingComplete,
  normalizeMentorOnboardingState,
} from '../../utils/mentorOnboarding';

const MentorApply: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMentor = user?.role?.toLowerCase() === 'mentor';
  const { data: onboardingState } = useMentorOnboardingStateQuery(isMentor);

  const mentorUser = user as {
    onboardingStep?: number;
    onboardingCompleted?: boolean;
    isOnboardingComplete?: boolean;
  } | null;

  // Use API step when available; don't block Proceed while state is still loading.
  const profileStep = onboardingState?.data
    ? getMentorOnboardingProfileStep(onboardingState.data, mentorUser?.onboardingStep)
    : mentorUser?.onboardingStep && mentorUser.onboardingStep >= 1
      ? Math.min(mentorUser.onboardingStep, 5)
      : 1;

  const handleProceed = () => {
    navigate(getMentorOnboardingProceedRoute(profileStep, mentorUser));
  };

  const isComplete = isMentorOnboardingComplete({
    onboardingStep: profileStep,
    onboardingCompleted: normalizeMentorOnboardingState(onboardingState?.data)
      ?.onboardingCompleted,
    isOnboardingComplete: mentorUser?.isOnboardingComplete,
  });

  return (
    <div className="max-w-2xl mx-auto py-12 sm:py-16 px-4 sm:px-6">
      <h1 className="text-2xl sm:text-[28px] font-medium text-[#1C1C1C] leading-[36px] tracking-[-1%] mb-2 flex flex-wrap items-center gap-x-2">
        Welcome to Vora
      </h1>
      <h2 className="text-lg sm:text-xl font-medium text-[#1C1C1C]  mb-8">
        Let's set up your mentor profile
      </h2>

      <div className="space-y-4 mb-10 text-sm sm:text-[15px] text-[#374151] leading-relaxed">
        <p>
          VORA mentors support career-ready professionals navigating critical career decisions, global opportunities, and role transitions.
        </p>
        <p>
          Your experience helps candidates strengthen judgment, readiness, and long-term growth without more or open-ended demands.
        </p>
        <p>
          All engagement happens on your terms.
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-base font-medium text-[#1C1C1C]  mb-3">
          What You'll Do
        </h3>
        <ul className="space-y-2 text-sm text-[#374151] leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#374151] flex-shrink-0"></span>
            Provide structured career guidance
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#374151] flex-shrink-0"></span>
            Review candidate readiness insights
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#374151] flex-shrink-0"></span>
            Support structured, time-bound mentorship sessions
          </li>
        </ul>
      </div>

      <div className="mb-12">
        <h3 className="text-base font-medium text-[#1C1C1C]  mb-3">
          What You'll Get
        </h3>
        <ul className="space-y-2 text-sm text-[#374151] leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#374151] flex-shrink-0"></span>
            Time-bound sessions
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#374151] flex-shrink-0"></span>
            Pre-screened candidates only
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#374151] flex-shrink-0"></span>
            You control availability and visibility
          </li>
        </ul>
      </div>

      <div className="max-w-[480px] mx-auto">
        <Button type="button" variant="primary" onClick={handleProceed}>
          {isComplete ? 'Go to dashboard' : 'Proceed'}
        </Button>
      </div>
    </div>
  );
};

export default MentorApply;
