import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import VoraLogo from '../../components/common/VoraLogo';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import StageRail from '../../components/talent/StageRail';
import { useGateVerdictQuery } from '../../services/queries/assessments';
import { resolveGate1AssessmentId } from '../../config/gate1Api';
import { unwrapAssessmentData } from '../../utils/assessmentSession';
import type { GateVerdictResponse } from '../../services/queries/assessments/types';

const DocumentCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const LightBulbIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.663 17h4.673M12 3v1M3.34 7l.7.7M20.66 7l-.7.7M21 12h-1M4 12H3M12 21v-1M7 19a7 7 0 1 1 10 0H7z"/>
  </svg>
);

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const FileCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <polyline points="9 15 11 17 15 13"/>
  </svg>
);

const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

const PulseWarningIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);

const LockRectIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const RoleAssessmentSessionTwoOutcome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const assessmentId = resolveGate1AssessmentId() ?? '';
  const { data: verdictRaw } = useGateVerdictQuery(assessmentId, 1, {
    enabled: !!assessmentId,
  });
  const verdict = unwrapAssessmentData<GateVerdictResponse>(verdictRaw);

  const firstName = verdict?.talent?.firstName || user?.firstName || 'there';
  const recType = verdict?.diagnosis?.recommendationType || 'mentorship';

  const formatRecType = (type?: string) => {
    if (!type) return 'mentorship';
    if (type === 'self_directed') return 'self-directed learning';
    if (type === 'course') return 'a structured course';
    return type;
  };

  const handleApplyMentorship = () => {
    alert('Mentorship application opens here');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const getPrimaryActionLabel = () => {
    if (recType === 'mentorship') {
      return `Apply for ${verdict?.mentor?.name ? `${verdict.mentor.name}'s ` : ''}mentorship`;
    }
    if (recType === 'course') {
      return 'Enroll in recommended course';
    }
    return 'Explore learning resources';
  };

  const handlePrimaryAction = () => {
    if (recType === 'mentorship') {
      handleApplyMentorship();
    } else if (recType === 'course') {
      toast.success('Redirecting to course enrollment...');
      navigate('/dashboard');
    } else {
      toast.success('Redirecting to learning resources...');
      navigate('/dashboard');
    }
  };

  const gaps = [
    {
      name: 'Situational judgement under competing priorities',
      score: 66,
      desc: 'In the multi-stakeholder SJT items, your reads tended toward the most diplomatic option rather than the strongest one. At senior officer level, Reach Africa needs the person who will hold the harder line when the diplomatic answer protects the wrong stakeholder.',
      icon: <DocumentCheckIcon className="w-[18px] h-[18px]" />,
    },
    {
      name: 'Decisiveness under time pressure',
      score: 71,
      desc: 'Across the psychometric and SJT timed segments, your response pattern showed deliberation that\'s strong in low-pressure settings but reads as hesitation in time-bound ones. This is a common pattern at your level and entirely reshapeable.',
      icon: <ClockIcon className="w-[18px] h-[18px]" />,
    },
  ];

  const alternativeRoles = [
    {
      initials: 'SF',
      title: 'Senior Programme Officer · Adolescent Health and Wellbeing',
      company: 'Save the Children Nigeria · Abuja',
      posted: 'Posted 3 days ago',
      salary: '₦19-23M / year',
      closes: 'Closes in 14 days',
      match: 91,
      logoColor: 'bg-[#0047CC]', // Blue instead of green
    },
    {
      initials: 'IR',
      title: 'Programme Manager · Community-Based Maternal Outreach',
      company: 'International Rescue Committee · Maiduguri, Borno',
      posted: 'Posted 5 days ago',
      salary: '₦21-26M / year',
      closes: 'Closes in 19 days',
      match: 89,
      logoColor: 'bg-[#0F766E]',
    },
    {
      initials: 'PA',
      title: 'Senior Officer · Reproductive Health Policy Implementation',
      company: 'Pathfinder International · Lagos',
      posted: 'Posted 1 day ago',
      salary: '₦17-21M / year',
      closes: 'Closes in 28 days',
      match: 86,
      logoColor: 'bg-[#182348]',
    },
  ];

  const getIconForGap = (key: string) => {
    if (key.includes('time') || key.includes('rank')) {
      return <ClockIcon className="w-[18px] h-[18px]" />;
    }
    return <DocumentCheckIcon className="w-[18px] h-[18px]" />;
  };

  const gapsList = verdict?.gaps?.map((gp) => ({
    name: gp.label,
    score: gp.scorePercent,
    desc: gp.explanation,
    icon: getIconForGap(gp.key),
  })) || gaps;

  const gapLabels = verdict?.gaps && verdict.gaps.length > 0
    ? verdict.gaps.map(g => g.label.toLowerCase()).join(', ')
    : 'decisiveness and stakeholder judgement';

  const endorsementPhrase = recType === 'mentorship'
    ? `Once ${verdict?.mentor?.name || 'your mentor'}'s endorsement lands on your skills ledger`
    : recType === 'course'
    ? 'Once your course completion certificate lands on your skills ledger'
    : 'Once your self-directed development lands on your skills ledger';

  const endorsementSubject = recType === 'mentorship'
    ? `${verdict?.mentor?.name || 'Your mentor'}'s endorsement`
    : recType === 'course'
    ? 'Your course certification'
    : 'Your verified skill development';

  const formatPostedLabel = (postedAtStr: string) => {
    try {
      const diffMs = Date.now() - new Date(postedAtStr).getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return 'Posted today';
      return `Posted ${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } catch {
      return 'Posted recently';
    }
  };

  const formatClosesLabel = (closesAtStr: string) => {
    try {
      const diffMs = new Date(closesAtStr).getTime() - Date.now();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return 'Closes soon';
      return `Closes in ${diffDays} days`;
    } catch {
      return 'Closes soon';
    }
  };

  const getLogoInitials = (employerName: string) => {
    return employerName
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  };

  const getLogoColor = (idx: number) => {
    const colors = ['bg-[#0047CC]', 'bg-[#0F766E]', 'bg-[#182348]'];
    return colors[idx % colors.length];
  };

  const alternativeRolesList = verdict?.futureRoles?.map((rl, idx) => ({
    initials: getLogoInitials(rl.employerName),
    title: rl.roleTitle,
    company: `${rl.employerName} · ${rl.location}`,
    posted: formatPostedLabel(rl.postedAt),
    salary: `${rl.salaryLabel} / year`,
    closes: formatClosesLabel(rl.closesAt),
    match: rl.projectedMatchPercent,
    logoColor: getLogoColor(idx),
  })) || alternativeRoles;

  const rolesCloseTitle = alternativeRolesList.length === 1
    ? "If that role closes before you finish, you still don't lose anything"
    : `If those ${alternativeRolesList.length} roles close before you finish, you still don't lose anything`;

  const qualificationSuffix = recType === 'mentorship' 
    ? 'once the mentorship is complete' 
    : recType === 'course' 
    ? 'once the course is complete' 
    : 'once you complete your self-directed learning';

  const showMentor = verdict === undefined ? true : verdict?.mentor != null;
  const showAlternativeRoles = verdict === undefined ? true : (verdict?.futureRoles && verdict.futureRoles.length > 0);

  const displayScore = verdict?.score ?? 73;

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col relative pb-[80px]">

      {/* Top Bar */}
      <header className="bg-white/95 backdrop-blur-[10px] px-[20px] sm:px-[32px] py-[12px] flex items-center justify-between sticky top-0 z-[50]">
        <span className="inline-flex items-center gap-[1px] text-[#0047CC]">
          <VoraLogo size="sm" to="/dashboard" />
        </span>
        <div className="text-[12.5px] text-[#808080] font-[600]">
          Stage 1 · Outcome and what to do next
        </div>
        <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
          <div className="w-[16px] h-[16px] rounded-full border border-[#0047CC] bg-white flex items-center justify-center shrink-0">
            <DocumentCheckIcon className="w-[9px] h-[9px] text-[#0047CC]" />
          </div>
          Saved
        </div>
      </header>

      {/* Stage Rail */}
      <StageRail activeStage={1} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#293548] text-white p-[48px_32px_60px] relative overflow-hidden">
        <div className="absolute top-[-100px] right-[-80px] w-[340px] h-[340px] rounded-full bg-white/[0.03]" />
        
        <div className="relative z-10 max-w-[880px] mx-auto">
          <div className="inline-flex items-center gap-[7px] bg-white/10 border border-white/18 rounded-[100px] p-[6px_14px] backdrop-blur-[6px] mb-[16px]">
            <InfoIcon className="w-[13px] h-[13px]" />
            <span className="text-[11.5px] font-[800] tracking-[0.7px] uppercase text-white/90">
              Stage 1 outcome · with your next path
            </span>
          </div>

          <h1 className="text-[30px] font-[900] tracking-[-0.4px] leading-[1.22] mb-[14px] max-w-[660px]">
            {verdict?.headline || `This role isn't moving forward, ${firstName}, and we'd like to be useful about what's next`}
          </h1>
          <p className="text-[15.5px] text-white/80 leading-[1.7] max-w-[560px]">
            {verdict?.summary || `Stage 1 didn't clear the threshold ${verdict?.role?.employerName || 'Reach Africa'} set for this specific role. The gap pattern points to something more about judgement style than knowledge, so the path we're suggesting reflects that.`}
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-[880px] w-full mx-auto px-[20px] sm:px-[28px] mt-[-32px] pb-[90px] relative z-20 flex-1">
        
        {/* Honest Message Card */}
        <div className="bg-white rounded-[18px] p-[28px_32px] mb-[22px] border border-[#E6E6E6] shadow-[0_12px_36px_rgba(10,17,114,0.08)]">
          {verdict?.narrativeParagraphs && verdict.narrativeParagraphs.length > 0 ? (
            verdict.narrativeParagraphs.map((para, idx) => (
              <p key={idx} className="text-[15px] text-[#4A4A4A] leading-[1.85] mb-[14px] last:mb-0">
                {para}
              </p>
            ))
          ) : (
            <>
              <p className="text-[15px] text-[#4A4A4A] leading-[1.85] mb-[14px]">
                You&apos;re not far off, and we won&apos;t pretend you are. We also won&apos;t soften the result.
              </p>
              <p className="text-[15px] text-[#4A4A4A] leading-[1.85] mb-[14px]">
                You do not move on to Stage 2. The three stages run in order and each is a wall at eighty per cent, so Stage 2 only opens once Stage 1 is passed and Stage 3 only once Stage 2 is passed. Your path now is the development below, built to close the exact gaps we found, not the professional interview. This specific role stays locked to you until you complete that development and level up. Other roles at your current level remain open, so you can match to a different one and interview for it whenever you choose. The development below is simply the path we recommend, because it is the one that changes the result.
              </p>
              <p className="text-[15px] text-[#4A4A4A] leading-[1.85] mb-[14px]">
                Your <strong className="font-[800] text-[#1A1A1A]">Stage 1 composite was {displayScore} of 100</strong>. {verdict?.role?.employerName || 'Reach Africa'} set the threshold at {verdict?.threshold ?? 80} for a {verdict?.role?.roleTitle || 'Senior Health Programme Officer'}. The shortfall sat almost entirely in two specific judgement-style areas, which are more about approach than recall.
              </p>
              <p className="text-[15px] text-[#4A4A4A] leading-[1.85]">
                That&apos;s important, because <strong className="font-[800] text-[#1A1A1A]">judgement-shaped gaps don&apos;t usually close with a course</strong>. They close with someone you trust in your space watching how you think and pushing back. So that&apos;s what we&apos;re recommending.
              </p>
            </>
          )}
        </div>

        {/* Where Stage 1 Fell Short (Why Card) */}
        <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[18px] p-[26px_30px] mb-[18px]">
          <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-[8px]">
            Where Stage 1 fell short
          </div>
          <h2 className="text-[18px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-[6px] leading-[1.3]">
            {gapsList.length === 1 ? 'One area pulled the composite below threshold' : `${gapsList.length} areas pulled the composite below threshold`}
          </h2>
          <p className="text-[13.5px] text-[#808080] leading-[1.6] mb-[18px]">
            Most of Stage 1 read normally. {gapsList.length === 1 ? 'This one specifically' : 'These specifically'} read below where this role sits.
          </p>

          {/* Gap List */}
          <div className="flex flex-col gap-[14px]">
            {gapsList.map((gp, idx) => (
              <div key={idx} className="flex gap-[14px] items-start p-[16px_18px] bg-[#F4F8FF] border border-[#DBEAFE] rounded-[12px]">
                <div className="hidden sm:flex w-[34px] h-[34px] rounded-[9px] bg-white border border-[#BFDBFE] items-center justify-center text-[#0047CC] shrink-0">
                  {gp.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-[10px] mb-[5px] flex-wrap">
                    <div className="text-[14px] font-[800] text-[#1A1A1A] tracking-[-0.1px]">
                      {gp.name}
                    </div>
                    <div className="text-[14px] font-[900] text-[#0047CC] tabular-nums">
                      {gp.score}<small className="text-[11px] font-[700] text-[#808080] ml-[2px]">%</small>
                    </div>
                  </div>
                  <div className="text-[13px] text-[#3B4155] leading-[1.6]">
                    {gp.desc}
                  </div>
                  
                  {/* Progress Bar with Threshold */}
                  <div className="mt-[10px] h-[6px] bg-[#E2E8F0] rounded-[100px] overflow-hidden relative">
                    <div className="h-full bg-gradient-to-r from-[#0047CC] to-[#387DFF] rounded-[100px]" style={{ width: `${gp.score}%` }} />
                    <div className="absolute top-[-2px] bottom-[-2px] w-[2px] bg-[#475569] rounded-[1px]" style={{ left: `${verdict?.threshold ?? 80}%` }} />
                  </div>

                  <div className="flex justify-between text-[10.5px] text-[#808080] font-[700] mt-[5px]">
                    <span>Your score · {gp.score}%</span>
                    <strong className="text-[#475569] font-[800]">Threshold · {verdict?.threshold ?? 80}%</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnosis */}
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[14px] p-[20px_24px] mb-[18px] flex gap-[14px] items-start">
          <div className="w-[42px] h-[42px] rounded-[11px] bg-white border border-[#93C5FD] flex items-center justify-center text-[#1D4ED8] shrink-0">
            <LightBulbIcon className="w-[20px] h-[20px]" />
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-[800] text-[#1E40AF] mb-[5px]">
              Why we&apos;re suggesting {formatRecType(verdict?.diagnosis?.recommendationType)} rather than a course
            </div>
            <div className="text-[13px] text-[#1E40AF] leading-[1.65]">
              {verdict?.diagnosis?.rationale || 'Both gaps are about how you think when pressured, not what you know. A course can teach frameworks, but for this kind of growth, a mentor who\'s lived the seat and can stress-test your reasoning in real situations moves the needle more reliably. We\'ve made this call for you specifically, not as a default.'}
            </div>
          </div>
        </div>

        {showMentor && (
          <>
            {/* Curator recommendations */}
            <div className="bg-gradient-to-br from-[#1E293B] to-[#334155] text-white rounded-[18px] p-[32px_34px] mb-[18px] relative overflow-hidden">
              <div className="absolute top-[-80px] right-[-50px] w-[240px] h-[240px] rounded-full bg-white/[0.04]" />
              <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-white/75 mb-[8px] relative z-10">
                Curated recommendation
              </div>
              <h2 className="text-[22px] font-[900] text-white tracking-[-0.3px] leading-[1.25] mb-[10px] relative z-10">
                We&apos;ve matched you with someone in the top 1% of the 1%
              </h2>
              <p className="text-[14.5px] text-white/86 leading-[1.7] max-w-[580px] relative z-10">
                For decisiveness and judgement growth at senior officer level in African health programmes, one name in our network consistently moves candidates further than any cohort can. You&apos;re being matched with her directly.
              </p>
            </div>

            {/* Mentor profile */}
            <div className="bg-gradient-to-b from-white to-[#F8FAFC] border border-[#E2E8F0] rounded-[18px] overflow-hidden shadow-[0_12px_36px_rgba(0,71,204,0.04)] mb-[18px]">
              <div className="bg-[#0047CC] text-white px-[28px] py-[9px] text-[11px] font-[900] tracking-[1.5px] uppercase flex items-center justify-center gap-[8px]">
                <StarIcon className="w-[13px] h-[13px]" />
                Faculty pick · Top 1% globally · Mentorship-led
              </div>
              
              <div className="p-[30px_34px]">
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left mb-[18px]">
                  <div className="w-[74px] h-[74px] rounded-full bg-gradient-to-br from-[#0047CC] to-[#387DFF] text-white flex items-center justify-center font-[900] text-[22px] shrink-0 relative shadow-[0_8px_22px_rgba(0,71,204,0.18)] before:content-[''] before:absolute before:inset-[-4px] before:border-2 before:border-[#387DFF] before:opacity-60 before:rounded-full mx-auto sm:mx-0">
                    {verdict?.mentor ? getLogoInitials(verdict.mentor.name) : 'NM'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="inline-flex items-center gap-[6px] bg-[#EBF6FF] text-[#0047CC] text-[10.5px] font-[900] tracking-[0.8px] uppercase px-[10px] py-[4px] rounded-[6px] mb-[6px]">
                      <StarIcon className="w-[11px] h-[11px]" />
                      Your mentor
                    </div>
                    <div className="text-[18px] font-[900] text-[#1A1A1A] tracking-[-0.3px] leading-[1.2] mb-[3px]">
                      {verdict?.mentor?.name || 'Dr Nadia Mwangi, MPH, FFPH'}
                    </div>
                    <div className="text-[13px] text-[#4A4A4A] leading-[1.5] font-[600]">
                      {verdict?.mentor?.bio || 'Former Country Director, MSF Kenya. Co-founder of the East Africa Programme Leadership Fellowship. Mentored 240+ senior health programme leaders, including 18 current country directors across sub-Saharan Africa.'}
                    </div>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-[8px] mt-[8px]">
                      {verdict?.mentor?.credentials ? (
                        verdict.mentor.credentials.map((cred, idx) => (
                          <span key={idx} className="text-[11px] bg-[#F7F7F7] text-[#4A4A4A] font-[700] px-[9px] py-[3px] rounded-[6px]">
                            {cred}
                          </span>
                        ))
                      ) : (
                        <>
                          <span className="text-[11px] bg-[#EBF6FF] text-[#0047CC] font-[800] px-[9px] py-[3px] rounded-[6px]">Aspen Africa Leadership Fellow</span>
                          <span className="text-[11px] bg-[#F7F7F7] text-[#4A4A4A] font-[700] px-[9px] py-[3px] rounded-[6px]">Former Gates Foundation Senior Advisor</span>
                          <span className="text-[11px] bg-[#F7F7F7] text-[#4A4A4A] font-[700] px-[9px] py-[3px] rounded-[6px]">20+ years field leadership</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <h3 className="text-[21px] font-[900] text-[#1A1A1A] tracking-[-0.3px] leading-[1.3] mb-[8px]">
                  {verdict?.mentor?.programmeTitle || 'The Senior Decision-Maker Programme · 1:1 with Dr Mwangi'}
                </h3>
                <p className="text-[14px] text-[#4A4A4A] leading-[1.7] mb-[18px]">
                  {verdict?.mentor?.programmeDescription || 'Eight weeks of structured 1:1 mentorship designed for senior health professionals whose Stage 1 reads showed judgement-style gaps. Real situations from her own career and yours. Dr Mwangi works with no more than twelve mentees at a time, and she chose to take this on personally based on your profile.'}
                </p>

                {/* Mentor stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-[8px] mb-[18px]">
                  {[
                    { label: 'Duration', val: verdict?.mentor ? `${verdict.mentor.durationWeeks} weeks` : '8 weeks' },
                    { label: 'Format', val: verdict?.mentor?.format || '1:1 · weekly' },
                    { label: 'Per session', val: verdict?.mentor ? `${verdict.mentor.sessionMinutes} min` : '60 min' },
                    { label: 'Next opening', val: 'Starts 12 days' },
                  ].map((st, i) => (
                    <div key={i} className="bg-[#F8FAFC] border border-[#EDF2F7] rounded-[10px] p-[11px_12px] text-center">
                      <div className="text-[10px] font-[800] tracking-[0.5px] uppercase text-[#808080] mb-[3px]">{st.label}</div>
                      <div className="text-[14.5px] font-[900] text-[#1A1A1A] tracking-[-0.2px]">{st.val}</div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-[10px] flex-wrap items-center">
                  <Button
                    onClick={handleApplyMentorship}
                    className="bg-[#0047CC] text-white hover:bg-[#344DA1] shadow-[0_4px_14px_rgba(0,71,204,0.22)] font-[800]"
                    pill={false}
                  >
                    Apply for this mentorship
                  </Button>
                  <div className="text-[12.5px] text-[#808080] font-[700] flex items-center gap-[6px]">
                    <strong className="text-[#1A1A1A] text-[15px] font-[900]">
                      {verdict?.mentor ? `${verdict.mentor.priceCurrency}${verdict.mentor.priceAmount.toLocaleString()}` : '₦220,000'}
                    </strong>
                    · installment available · partial scholarship for first 4 of 12 mentees
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {showAlternativeRoles && (
          <>
            {/* Alternative Roles Card */}
            <div className="bg-white rounded-[18px] p-[28px_30px] mb-[18px] border border-[#E6E6E6] shadow-[0_8px_24px_rgba(10,17,114,0.06)] relative overflow-hidden">
              <div className="flex justify-between items-start gap-[14px] mb-[6px] flex-wrap">
                <div>
                  <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-[6px]">
                    Roles waiting on the other side
                  </div>
                  <h2 className="text-[19px] font-[900] text-[#1A1A1A] tracking-[-0.2px] leading-[1.3]">
                    {alternativeRolesList.length === 1 
                      ? `One open role you'll directly qualify for ${qualificationSuffix}` 
                      : `${alternativeRolesList.length} open roles you'll directly qualify for ${qualificationSuffix}`}
                  </h2>
                </div>
              </div>
              <p className="text-[13.5px] text-[#808080] leading-[1.65] mt-[6px] mb-[18px] max-w-[600px]">
                These employers have all explicitly named {gapLabels} as competencies their hiring panels prioritise. {endorsementPhrase}, <strong className="font-[800]">your profile gets surfaced to them automatically.</strong>
              </p>

              <div className="flex flex-col gap-[10px]">
                {alternativeRolesList.map((rl, i) => (
                  <div 
                    key={i} 
                    onClick={() => navigate('/dashboard')}
                    className="flex flex-col gap-2.5 p-4 sm:p-[16px_18px] bg-white border-[1.5px] border-[#E6E6E6] rounded-[12px] transition-all duration-200 cursor-pointer hover:border-[#0047CC] hover:bg-[#FAFCFF] text-center items-center justify-center"
                  >
                    {/* Logo + Title + Match percent on one line (centered, wrapping naturally) */}
                    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 w-full">
                      <div className={`w-[28px] h-[28px] rounded-[6px] ${rl.logoColor} text-white flex items-center justify-center font-[900] text-[10px] tracking-[0.3px] shrink-0`}>
                        {rl.initials}
                      </div>
                      <span className="text-[13.5px] sm:text-[14px] font-[800] text-[#1A1A1A] tracking-[-0.1px] leading-snug">
                        {rl.title}
                      </span>
                      <span className="text-[11px] font-[900] text-[#0047CC] bg-[#EBF6FF] px-[6px] py-[1.5px] rounded-[4px] shrink-0 whitespace-nowrap">
                        {rl.match}% match
                      </span>
                    </div>

                    {/* Company Name centered below */}
                    <div className="text-[12px] text-[#808080] font-[600] leading-[1.3] -mt-1">
                      {rl.company}
                    </div>

                    {/* Metadata row centered below */}
                    <div className="flex items-center justify-center gap-x-3 gap-y-1.5 flex-wrap text-[#808080] text-[11px] font-[600] pt-2 border-t border-[#F1F5F9] w-full">
                      <span className="flex items-center gap-[4px]">
                        <ClockIcon className="w-[11.5px] h-[11.5px]" />
                        {rl.posted}
                      </span>
                      <span className="flex items-center gap-[4px]">
                        <PulseWarningIcon className="w-[11.5px] h-[11.5px]" />
                        {rl.salary}
                      </span>
                      <span className="text-[9.5px] text-[#0047CC] bg-[#EBF6FF] px-[7px] py-[2px] rounded-[5px] font-[800] tracking-[0.3px] uppercase">
                        {rl.closes}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ledger card */}
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[14px] p-[20px_24px] mb-[22px] flex gap-[14px] items-start">
              <div className="w-[42px] h-[42px] rounded-[11px] bg-white border border-[#93C5FD] flex items-center justify-center text-[#1D4ED8] shrink-0">
                <FileCheckIcon className="w-[20px] h-[20px]" />
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-[800] text-[#1E40AF] mb-[5px]">
                  {rolesCloseTitle}
                </div>
                <div className="text-[13px] text-[#2563EB] leading-[1.65]">
                  {endorsementSubject} lives permanently on <strong className="font-[800] text-[#1E40AF]">your skills ledger</strong>. The moment a role posts that matches your updated profile, you&apos;ll get an email the same day with a direct match link. No reapplication, no recompete. You&apos;ll be one of the first profiles surfaced to that employer.
                </div>
              </div>
            </div>
          </>
        )}

        {/* Actions Footer */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
          <Button
            variant="outline"
            onClick={handleBackToDashboard}
            className="w-full sm:w-auto"
            pill={false}
          >
            Back to dashboard
          </Button>
          <Button
            onClick={handlePrimaryAction}
            className="bg-[#0047CC] text-white hover:bg-[#344DA1] shadow-[0_4px_14px_rgba(0,71,204,0.22)] w-full sm:w-auto flex items-center justify-center gap-2 font-[800]"
            pill={false}
          >
            {getPrimaryActionLabel()}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default RoleAssessmentSessionTwoOutcome;
