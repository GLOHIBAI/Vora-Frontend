import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import AlertBanner from '../../components/common/AlertBanner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Tag from '../../components/common/Tag';
import Textarea from '../../components/common/Textarea';
import {
  CardTitle,
  PageTitle,
  SectionDescription,
  Subheading,
} from '../../components/common/Typography';
import { 
  CheckIcon, 
  CloseIcon, 
  VideoIcon, 
  LocationIcon, 
  ChevronDownIcon, 
  ChevronRightIcon, 
  AlertTriangleIcon,
} from '../../components/common/Icons';
import type { PaymentsTabType, DecisionStatus } from '../../types';

const Payments: React.FC = () => {
  // Candidate Decisions State
  const [amaraStatus, setAmaraStatus] = useState<DecisionStatus>('pending');
  const [amaraSalary, setAmaraSalary] = useState<string>('');
  const [priyaStatus, setPriyaStatus] = useState<DecisionStatus>('pending');
  const [priyaSalary, setPriyaSalary] = useState<string>('');

  // Active Tabs State
  const [amaraTab, setAmaraTab] = useState<PaymentsTabType>('session');
  const [priyaTab, setPriyaTab] = useState<PaymentsTabType>('session');

  // Expanded History Items State
  const [expandedHist, setExpandedHist] = useState<{ [key: string]: boolean }>({
    yusuf: false,
    kofi: false,
    adaeze: false,
  });

  // Modal State
  const [hireModalOpen, setHireModalOpen] = useState(false);
  const [hireTarget, setHireTarget] = useState<'amara' | 'priya' | null>(null);
  const [tempSalary, setTempSalary] = useState('');

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<'amara' | 'priya' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');

  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoTarget, setVideoTarget] = useState<'amara' | 'priya' | null>(null);

  const toggleHist = (id: string) => {
    setExpandedHist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openHireModal = (target: 'amara' | 'priya') => {
    setHireTarget(target);
    setTempSalary(target === 'amara' ? amaraSalary : priyaSalary);
    setHireModalOpen(true);
  };

  const confirmHire = () => {
    if (!tempSalary) {
      toast.error('Please declare the final accepted salary to calculate any true-up.');
      return;
    }
    if (hireTarget === 'amara') {
      setAmaraStatus('hired');
      setAmaraSalary(tempSalary);
      toast.success('Dr. Amara Osei hired successfully! $150 alignment fee refunded to wallet.');
    } else if (hireTarget === 'priya') {
      setPriyaStatus('hired');
      setPriyaSalary(tempSalary);
      toast.success('Priya Sharma hired successfully! $150 alignment fee refunded to wallet.');
    }
    setHireModalOpen(false);
    setHireTarget(null);
  };

  const openRejectModal = (target: 'amara' | 'priya') => {
    setRejectTarget(target);
    setRejectReason('');
    setRejectNotes('');
    setRejectModalOpen(true);
  };

  const confirmReject = () => {
    if (!rejectReason) {
      toast.error('Please select a rejection reason.');
      return;
    }
    if (rejectTarget === 'amara') {
      setAmaraStatus('rejected');
      toast.success('Rejection submitted for Dr. Amara Osei. VORA will review your reason within 2 business days.');
    } else if (rejectTarget === 'priya') {
      setPriyaStatus('rejected');
      toast.success('Rejection submitted for Priya Sharma. VORA will review your reason within 2 business days.');
    }
    setRejectModalOpen(false);
    setRejectTarget(null);
  };

  const openVideoModal = (target: 'amara' | 'priya') => {
    setVideoTarget(target);
    setVideoModalOpen(true);
  };

  // Helper values
  const totalHeldAmount = 
    (amaraStatus === 'pending' ? 150 : 0) + 
    (priyaStatus === 'pending' ? 150 : 0);

  return (
    <div className="max-w-[1000px] mx-auto py-6 px-4 md:px-0 space-y-8 animate-fadeIn duration-500">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/payments" className="text-[#0047CC] hover:underline font-semibold cursor-pointer">Payments</Link>
        <ChevronRightIcon size={14} className="text-gray-400" />
        <span className="text-gray-600 font-medium">Alignment Session Review</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <PageTitle className="text-3xl">Alignment Session Review</PageTitle>
        <SectionDescription className="text-sm text-gray-500 max-w-3xl">
          Review candidates from additional alignment sessions. Full assessment scores below. Hire for full refund · Reject with valid documented reason for refund · Invalid rejection forfeits fee.
        </SectionDescription>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        {/* Left Column: Candidates & History */}
        <div className="space-y-6">
          {/* Policy Info Box */}
          <AlertBanner variant="blue" className="!text-xs">
            <strong>Alignment fee policy:</strong> $150 per additional session (beyond standard interview).{' '}
            <strong>Hire</strong> → full auto-refund. <strong>Reject with valid documented reason</strong> → VORA
            reviews within 2 days → refund if valid. <strong>Reject without valid reason</strong> → fee forfeited
            + account warning issued.
          </AlertBanner>

          {/* ═══════════ CANDIDATE 1: DR. AMARA OSEI ═══════════ */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-4 p-5 border-b border-gray-100 flex-wrap sm:flex-nowrap">
              <div className="w-11 h-11 rounded-full bg-[#EBF6FF] text-[#0047CC] flex items-center justify-center font-bold text-sm shrink-0">
                AO
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <h2 className="text-base font-bold text-gray-900">Dr. Amara Osei</h2>
                  <Tag label="Public Health Advisor" variant="blue" className="text-[10px] py-0.5 font-bold" />
                </div>
                <p className="text-xs text-gray-500">Medics Without Limits · Accra, Ghana · Session 2 of 2</p>
              </div>

              {amaraStatus === 'pending' && (
                <Tag label="Awaiting Decision" variant="yellow" className="text-xs py-1 font-bold animate-in fade-in" />
              )}
              {amaraStatus === 'hired' && (
                <Tag label="Hired (Refunded)" variant="green" className="text-xs py-1 font-bold animate-in fade-in" />
              )}
              {amaraStatus === 'rejected' && (
                <Tag label="Rejected (In Review)" variant="red" className="text-xs py-1 font-bold animate-in fade-in" />
              )}
            </div>

            {/* Body */}
            <div className="p-5">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-5 overflow-x-auto scrollbar-hide gap-1">
                {(['session', 'psychometric', 'sjt', 'video', 'overall'] as PaymentsTabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setAmaraTab(tab)}
                    className={`pb-2.5 px-3.5 text-xs font-semibold border-b-[2px] -mb-[1px] transition-all whitespace-nowrap outline-none cursor-pointer ${
                      amaraTab === tab
                        ? 'text-[#0047CC] border-[#0047CC] font-bold'
                        : 'text-gray-500 border-transparent hover:text-gray-800'
                    }`}
                  >
                    {tab === 'session' && 'Session Details'}
                    {tab === 'psychometric' && 'Psychometric'}
                    {tab === 'sjt' && 'Situational Judgement'}
                    {tab === 'video' && 'Video Interview'}
                    {tab === 'overall' && 'Overall Decision'}
                  </button>
                ))}
              </div>

              {/* Tab Panels */}
              {amaraTab === 'session' && (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500 font-semibold">Session type</span><span className="text-gray-900 font-bold">2nd additional alignment session</span></div>
                  <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500 font-semibold">Date conducted</span><span className="text-gray-900 font-bold">March 5, 2025 · 11:00 AM GMT</span></div>
                  <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500 font-semibold">Duration</span><span className="text-gray-900 font-bold">48 minutes</span></div>
                  <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500 font-semibold">Alignment fee</span><span className="text-[#D97706] font-bold">$150.00 · Ref #ALN-2025-0015</span></div>
                  <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500 font-semibold">Job role</span><span className="text-gray-900 font-bold">Public Health Advisor – Medics Without Limits</span></div>
                  <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500 font-semibold">Location</span><span className="text-gray-900 font-bold flex items-center gap-1"><LocationIcon size={12} className="text-gray-400" /> Accra, Ghana · On-site · Global South</span></div>
                  <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500 font-semibold">VORA reviewer</span><span className="text-gray-900 font-bold">Dr. Kwame Asante (Global Health Lead)</span></div>
                  <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500 font-semibold">Escrow held (role)</span><span className="text-gray-900 font-bold">$4,500 · Contract 6–12mo · Min. tenure deposit</span></div>
                  <div className="flex justify-between py-2"><span className="text-gray-500 font-semibold">Refund on hire</span><span className="text-[#1D871D] font-bold">$150 auto-refunded immediately</span></div>
                </div>
              )}

              {amaraTab === 'psychometric' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Overall Psychometric Score</h4>
                      <div className="text-3xl font-semibold text-[#0047CC] leading-none">87<span className="text-sm font-normal text-gray-400">/100</span></div>
                      <Tag label="✓ Above threshold (80)" variant="green" className="mt-1 text-[10px] py-0.5" />
                    </div>
                    <div className="text-xs text-gray-600 leading-relaxed">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Test Completed</h4>
                      Feb 28, 2025 · 42 min<br/>Norm group: Global Health Professionals<br/>Provider: VORA Assessment Engine
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Domain Breakdown</h4>
                    {[
                      { label: 'Abstract Reasoning', val: 92, text: 'Percentile: 94th · Identifies complex patterns; rapid logical inference under time pressure', color: 'bg-[#0047CC]' },
                      { label: 'Verbal Reasoning', val: 88, text: 'Percentile: 89th · Strong comprehension of technical health literature; precise language use', color: 'bg-[#0047CC]' },
                      { label: 'Numerical Reasoning', val: 84, text: 'Percentile: 81st · Accurate statistical interpretation; some hesitation on compound ratio problems', color: 'bg-[#2CA62C]' },
                      { label: 'Working Memory', val: 82, text: 'Percentile: 78th · Retains multi-variable information effectively in complex scenarios', color: 'bg-[#2CA62C]' },
                      { label: 'Conscientiousness', val: 91, text: 'Top 8% in cohort · Exceptionally structured; self-directed under minimal supervision', color: 'bg-[#0047CC]' },
                      { label: 'Emotional Stability', val: 79, text: 'Percentile: 71st · Manages stress constructively; occasional over-preparation tendency noted', color: 'bg-[#2CA62C]' },
                      { label: 'Openness to Complexity', val: 90, text: 'Percentile: 91st · Seeks out novel problems; thrives in ambiguous global health environments', color: 'bg-[#0047CC]' }
                    ].map((item) => (
                      <div key={item.label} className="text-xs">
                        <div className="flex justify-between font-bold mb-1">
                          <span className="text-gray-800">{item.label}</span>
                          <span className="text-gray-900">{item.val}/100</span>
                        </div>
                        <div className="h-2 bg-gray-150 rounded-full overflow-hidden mb-1">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.val}%` }}></div>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-normal">{item.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-[#EBF6FF] border border-[#387DFF]/20 rounded-xl text-xs text-[#1e40af] leading-relaxed">
                    <strong>Psychometric interpretation:</strong> Dr. Osei scores above the 80-point VORA threshold in all seven domains. Her composite score of 87/100 places her in the top 13% of all global health professionals assessed on this platform. Abstract reasoning and conscientiousness are standout strengths. No red flags in profile consistency checks.
                  </div>
                </div>
              )}

              {amaraTab === 'sjt' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">SJT Overall Score</h4>
                      <div className="text-3xl font-semibold text-[#2CA62C] leading-none">83<span className="text-sm font-normal text-gray-400">/100</span></div>
                      <Tag label="✓ Above threshold (80)" variant="green" className="mt-1 text-[10px] py-0.5" />
                    </div>
                    <div className="text-xs text-gray-600 leading-relaxed">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 font-semibold">Test Completed</h4>
                      Mar 1, 2025 · 20 scenarios · 40 min<br/>Domain: Global Health &amp; Public Health Systems<br/>Validated against WHO competency framework
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Domain Breakdown</h4>
                    {[
                      { label: 'Ethical Decision-Making', val: 89, text: 'Correctly prioritised community welfare over institutional convenience in 8/8 scenarios. Cited ICRC neutrality principles and equity frameworks unprompted.', color: 'bg-[#2CA62C]' },
                      { label: 'Crisis & Resource Triage', val: 85, text: 'Excellent triage logic in cholera outbreak simulation. Ranked second in multi-site allocation exercise. One sub-optimal response on PPE shortage scenario.', color: 'bg-[#2CA62C]' },
                      { label: 'Cross-Cultural Communication', val: 90, text: 'Top response in community health worker engagement scenario. Demonstrated cultural humility without defaulting to stereotype-based assumptions.', color: 'bg-[#0047CC]' },
                      { label: 'Stakeholder & Donor Management', val: 78, text: 'Sound baseline responses. Slightly over-deferred to donor preference vs. community need in PEPFAR funding conflict scenario — noted area for development.', color: 'bg-[#2CA62C]' },
                      { label: 'Data Interpretation Under Pressure', val: 82, text: 'Correctly interpreted mortality rate trends in 4/5 time-pressured scenarios. One arithmetic error in composite index calculation corrected on reflection.', color: 'bg-[#2CA62C]' },
                      { label: 'Team Leadership & Delegation', val: 76, text: 'Adequate delegation instincts. Tendency toward over-centralisation in multi-team coordination scenarios. Development need flagged for senior advisory roles.', color: 'bg-[#2CA62C]' }
                    ].map((item) => (
                      <div key={item.label} className="text-xs">
                        <div className="flex justify-between font-bold mb-1">
                          <span className="text-gray-800">{item.label}</span>
                          <span className="text-gray-900">{item.val}/100</span>
                        </div>
                        <div className="h-2 bg-gray-150 rounded-full overflow-hidden mb-1">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.val}%` }}></div>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-normal">{item.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-[#EEFBEE] border border-[#2CA62C]/20 rounded-xl text-xs text-[#135813] leading-relaxed">
                    <strong>SJT interpretation:</strong> Dr. Osei demonstrates strong ethical reasoning and cross-cultural capability — the two highest-weight domains for Public Health Advisor roles. Her stakeholder management and delegation scores are within acceptable range but represent genuine development opportunities. Overall SJT result is a clear pass at 83/100.
                  </div>
                </div>
              )}

              {amaraTab === 'video' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 font-semibold">Video Interview Score</h4>
                      <div className="text-3xl font-semibold text-[#7C3AED] leading-none font-bold">81<span className="text-sm font-normal text-gray-400">/100</span></div>
                      <Tag label="✓ Above threshold (80)" variant="green" className="mt-1 text-[10px] py-0.5" />
                    </div>
                    <div className="text-xs text-gray-600 leading-relaxed">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 font-semibold">Session Info</h4>
                      Mar 3, 2025 · 28 min · 5 structured questions<br/>AI + human review · Recorded: HD, auto-captioned
                    </div>
                  </div>

                  {/* Video Mock */}
                  <div 
                    onClick={() => openVideoModal('amara')} 
                    className="relative cursor-pointer group bg-slate-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-gray-800"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/20 border border-white/40 flex items-center justify-center transition-all group-hover:bg-[#387DFF]/70 group-hover:border-[#387DFF]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" className="ml-0.5">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                    <div className="absolute bottom-2.5 left-3 text-[10px] text-white/70">
                      Dr. Amara Osei – Full Session · 28:14 · Mar 3, 2025
                    </div>
                    <div className="absolute top-2.5 right-3 bg-black/60 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                      Score: 81/100
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Question-by-Question Scores</h4>
                    {[
                      { label: 'Q1: Describe your most complex public health intervention', val: 88, text: 'Detailed account of malaria elimination programme in Upper West Region, Ghana. Cited specific DALY reductions. Strong evidence-based narrative.', color: 'bg-[#0047CC]' },
                      { label: 'Q2: How do you manage conflicting ministry and NGO priorities?', val: 79, text: 'Good structural answer using alignment-first framework. Slightly abstract — could have grounded in specific institutional example.', color: 'bg-[#2CA62C]' },
                      { label: 'Q3: Walk me through your data methodology for a needs assessment', val: 85, text: 'Named WHO STEPwise tool, DHIS2 integration, and community triangulation. Identified triangulation weaknesses in low-resource data environments.', color: 'bg-[#0047CC]' },
                      { label: 'Q4: Describe a time you led change in a resistant health system', val: 77, text: 'Competent STAR response. Story was compelling but change management framework somewhat implicit — could strengthen change vocabulary.', color: 'bg-[#2CA62C]' },
                      { label: 'Q5: What is your understanding of our organisational context?', val: 86, text: 'Well-researched. Referenced Medics Without Limits\' active programmes in Brong-Ahafo and Northern Region specifically.', color: 'bg-[#0047CC]' }
                    ].map((item) => (
                      <div key={item.label} className="text-xs">
                        <div className="flex justify-between font-bold mb-1">
                          <span className="text-gray-800">{item.label}</span>
                          <span className="text-gray-900">{item.val}/100</span>
                        </div>
                        <div className="h-2 bg-gray-150 rounded-full overflow-hidden mb-1">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.val}%` }}></div>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-normal">{item.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { label: 'Clarity of Communication', val: 'High', color: 'text-[#0047CC]' },
                      { label: 'Use of Evidence', val: 'Very Strong', color: 'text-[#1D871D]' },
                      { label: 'Confidence Level', val: 'Measured', color: 'text-[#1D871D]' },
                      { label: 'Technical Vocabulary', val: 'Expert', color: 'text-[#0047CC]' }
                    ].map(stat => (
                      <div key={stat.label} className="bg-gray-50 rounded-lg p-2.5">
                        <div className="text-[10px] text-gray-400 mb-0.5">{stat.label}</div>
                        <div className={`font-bold ${stat.color}`}>{stat.val}</div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-[#F5F3FF] border border-[#7C3AED]/20 rounded-xl text-xs text-[#5b21b6] leading-relaxed">
                    <strong>Video interpretation:</strong> Dr. Osei presents with strong technical credibility. Q1 and Q3 responses were standout. Areas for coaching: abstract-to-concrete grounding in Q2 and explicit change management vocabulary in Q4.
                  </div>
                </div>
              )}

              {amaraTab === 'overall' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="bg-[#EBF6FF] border border-[#387DFF]/20 rounded-xl p-3 flex flex-col items-center">
                      <h5 className="text-[10px] font-bold text-gray-500 uppercase mb-1">Psychometric</h5>
                      <div className="text-xl font-semibold text-[#0047CC] mb-1">87</div>
                      <Tag label="Pass" variant="blue" className="text-[9px] py-0 px-2" />
                    </div>
                    <div className="bg-[#EEFBEE] border border-[#2CA62C]/20 rounded-xl p-3 flex flex-col items-center">
                      <h5 className="text-[10px] font-bold text-gray-500 uppercase mb-1">SJT</h5>
                      <div className="text-xl font-semibold text-[#2CA62C] mb-1">83</div>
                      <Tag label="Pass" variant="green" className="text-[9px] py-0 px-2" />
                    </div>
                    <div className="bg-[#F5F3FF] border border-[#7C3AED]/20 rounded-xl p-3 flex flex-col items-center">
                      <h5 className="text-[10px] font-bold text-gray-500 uppercase mb-1">Video</h5>
                      <div className="text-xl font-semibold text-[#7C3AED] mb-1">81</div>
                      <Tag label="Pass" variant="purple" className="text-[9px] py-0 px-2" />
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-150 rounded-xl p-4">
                    <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Composite Score</h5>
                    <div className="text-2xl font-semibold text-gray-900">84 <span className="text-xs font-normal text-gray-400">/ 100 composite</span></div>
                    <p className="text-[10px] text-gray-500 mt-0.5">Weighted: Psychometric 35% · SJT 40% · Video 25%</p>
                  </div>

                  <div className="text-xs space-y-2">
                    <p className="font-bold text-gray-800">Why Dr. Osei passed all three assessments:</p>
                    <p className="text-gray-600 leading-relaxed">
                      <strong className="text-gray-700">Psychometric (87/100):</strong> Above-threshold in all 7 domains. Exceptional abstract reasoning (92) and conscientiousness (91) signal high capacity for unstructured global health environments.<br/>
                      <strong className="text-gray-700">SJT (83/100):</strong> Correctly prioritised community welfare in all ethical scenarios. Cross-cultural communication (90) is a critical competency.<br/>
                      <strong className="text-gray-700">Video (81/100):</strong> Programme experience is genuine and evidence-backed. Q1 on malaria intervention was particularly compelling.
                    </p>
                  </div>

                  <div className="p-3 bg-[#EEFBEE] border border-[#2CA62C]/20 rounded-xl text-xs text-[#135813] leading-relaxed flex gap-2">
                    <CheckIcon size={14} className="text-[#2CA62C] shrink-0 mt-0.5" strokeWidth={3} />
                    <div>
                      <strong>VORA recommendation:</strong> Dr. Osei is a strong candidate who has passed all three assessment gates. Her composite score of 84/100 ranks her in the top 15% of all Public Health Advisor candidates assessed on VORA in the past 12 months.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {amaraStatus === 'pending' && (
              <div className="p-4 bg-gray-50 border-t border-gray-150 flex justify-end gap-3 flex-wrap sm:flex-nowrap">
                <Button 
                  variant="outline" 
                  size="sm" 
                  fullWidth={false}
                  onClick={() => openRejectModal('amara')}
                  className="cursor-pointer font-bold shrink-0 text-xs px-4"
                >
                  <CloseIcon size={12} className="mr-1" />
                  Reject with Reason
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  fullWidth={false}
                  onClick={() => openHireModal('amara')}
                  className="cursor-pointer font-bold shrink-0 text-xs px-4 bg-[#0047CC] hover:bg-[#0039A6]"
                >
                  <CheckIcon size={12} className="mr-1" strokeWidth={3} />
                  Hire – Trigger Full Refund
                </Button>
              </div>
            )}
          </div>

          {/* ═══════════ CANDIDATE 2: PRIYA SHARMA ═══════════ */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-4 p-5 border-b border-gray-100 flex-wrap sm:flex-nowrap">
              <div className="w-11 h-11 rounded-full bg-[#EEFBEE] text-[#1D871D] flex items-center justify-center font-bold text-sm shrink-0">
                PS
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <h2 className="text-base font-bold text-gray-900">Priya Sharma</h2>
                  <Tag label="Senior Epidemiologist" variant="green" className="text-[10px] py-0.5 font-bold" />
                </div>
                <p className="text-xs text-gray-500">GlobalHealth Corp · Nairobi, Kenya · Session 1 of 1</p>
              </div>

              {priyaStatus === 'pending' && (
                <Tag label="Awaiting Decision" variant="yellow" className="text-xs py-1 font-bold animate-in fade-in" />
              )}
              {priyaStatus === 'hired' && (
                <Tag label="Hired (Refunded)" variant="green" className="text-xs py-1 font-bold animate-in fade-in" />
              )}
              {priyaStatus === 'rejected' && (
                <Tag label="Rejected (In Review)" variant="red" className="text-xs py-1 font-bold animate-in fade-in" />
              )}
            </div>

            {/* Body */}
            <div className="p-5">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-5 overflow-x-auto scrollbar-hide gap-1">
                {(['session', 'psychometric', 'sjt', 'video', 'overall'] as PaymentsTabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPriyaTab(tab)}
                    className={`pb-2.5 px-3.5 text-xs font-semibold border-b-[2px] -mb-[1px] transition-all whitespace-nowrap outline-none cursor-pointer ${
                      priyaTab === tab
                        ? 'text-[#0047CC] border-[#0047CC] font-bold'
                        : 'text-gray-500 border-transparent hover:text-gray-800'
                    }`}
                  >
                    {tab === 'session' && 'Session Details'}
                    {tab === 'psychometric' && 'Psychometric'}
                    {tab === 'sjt' && 'Situational Judgement'}
                    {tab === 'video' && 'Video Interview'}
                    {tab === 'overall' && 'Overall Decision'}
                  </button>
                ))}
              </div>

              {/* Tab Panels */}
              {priyaTab === 'session' && (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500 font-semibold">Session type</span><span className="text-gray-900 font-bold">1st additional alignment session</span></div>
                  <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500 font-semibold">Date conducted</span><span className="text-gray-900 font-bold">March 5, 2025 · 03:00 PM EAT</span></div>
                  <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500 font-semibold">Duration</span><span className="text-gray-900 font-bold">61 minutes</span></div>
                  <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500 font-semibold">Alignment fee</span><span className="text-[#D97706] font-bold">$150.00 · Ref #ALN-2025-0014</span></div>
                  <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500 font-semibold">Job role</span><span className="text-gray-900 font-bold">Senior Epidemiologist – GlobalHealth Corp</span></div>
                  <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500 font-semibold">Location</span><span className="text-gray-900 font-bold flex items-center gap-1"><LocationIcon size={12} className="text-gray-400" /> Nairobi, Kenya · Remote eligible · Global South</span></div>
                  <div className="flex justify-between py-2"><span className="text-gray-500 font-semibold">Escrow held (role)</span><span className="text-gray-900 font-bold">$10,500 · Range $60k–$80k · Midpoint $70k</span></div>
                </div>
              )}

              {priyaTab === 'psychometric' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 font-semibold">Overall Score</h4>
                      <div className="text-3xl font-semibold text-[#0047CC] leading-none">91<span className="text-sm font-normal text-gray-400">/100</span></div>
                      <Tag label="✓ Exceptional" variant="green" className="mt-1 text-[10px] py-0.5" />
                    </div>
                    <div className="text-xs text-gray-600 leading-relaxed">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 font-semibold">Test Info</h4>
                      Mar 2, 2025 · 38 min<br/>Norm: Epidemiology professionals<br/>Provider: VORA Assessment Engine
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Domain Breakdown</h4>
                    {[
                      { label: 'Abstract Reasoning', val: 95, text: 'Top 4% globally. Flawless performance on matrix pattern completion and inductive series — critical for epidemiological pattern recognition.', color: 'bg-[#0047CC]' },
                      { label: 'Numerical Reasoning', val: 93, text: 'Exceptional. All rate-based and proportion problems solved correctly. Near-perfect score in compound statistical inference.', color: 'bg-[#0047CC]' },
                      { label: 'Verbal Reasoning', val: 87, text: 'Strong technical reading comprehension; slight penalty on ambiguous inference questions.', color: 'bg-[#2CA62C]' },
                      { label: 'Conscientiousness', val: 92, text: 'Extremely high self-regulation and goal orientation. Consistent with epidemiology role demands.', color: 'bg-[#0047CC]' },
                      { label: 'Working Memory', val: 89, text: 'High multi-variable retention. Handles complex cohort tracking and confounding variable management with ease.', color: 'bg-[#2CA62C]' },
                      { label: 'Analytical Thinking', val: 94, text: 'Top 6% in cohort. Deconstructed all multi-step analytical problems correctly. Strong on systems causal chain mapping.', color: 'bg-[#0047CC]' }
                    ].map((item) => (
                      <div key={item.label} className="text-xs">
                        <div className="flex justify-between font-bold mb-1">
                          <span className="text-gray-800">{item.label}</span>
                          <span className="text-gray-900">{item.val}/100</span>
                        </div>
                        <div className="h-2 bg-gray-150 rounded-full overflow-hidden mb-1">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.val}%` }}></div>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-normal">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {priyaTab === 'sjt' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 font-semibold">SJT Score</h4>
                      <div className="text-3xl font-semibold text-[#2CA62C] leading-none">86<span className="text-sm font-normal text-gray-400">/100</span></div>
                      <Tag label="✓ Strong Pass" variant="green" className="mt-1 text-[10px] py-0.5" />
                    </div>
                    <div className="text-xs text-gray-600 leading-relaxed">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 font-semibold">Test Info</h4>
                      Mar 3, 2025 · 20 scenarios<br/>Epidemiology &amp; Disease Surveillance domain
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Domain Breakdown</h4>
                    {[
                      { label: 'Outbreak Investigation Protocol', val: 94, text: 'Correctly executed line listing, source identification, and case definition steps in all 4 outbreak simulations. Cited EpiInfo and REDCAP without prompting.', color: 'bg-[#0047CC]' },
                      { label: 'Data Ethics & Confidentiality', val: 88, text: 'Correctly applied GDPR/HIPAA equivalents in all cross-border data sharing scenarios. Flagged consent gaps that many candidates missed.', color: 'bg-[#0047CC]' },
                      { label: 'Cross-Sector Communication', val: 82, text: 'Good translation of technical findings to non-specialist audiences. Some over-reliance on technical jargon in ministry briefing.', color: 'bg-[#2CA62C]' },
                      { label: 'Resource Allocation Under Uncertainty', val: 79, text: 'Sound decisions but slightly conservative in ambiguous supply chain scenarios. Development opportunity noted.', color: 'bg-[#2CA62C]' }
                    ].map((item) => (
                      <div key={item.label} className="text-xs">
                        <div className="flex justify-between font-bold mb-1">
                          <span className="text-gray-800">{item.label}</span>
                          <span className="text-gray-900">{item.val}/100</span>
                        </div>
                        <div className="h-2 bg-gray-150 rounded-full overflow-hidden mb-1">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.val}%` }}></div>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-normal">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {priyaTab === 'video' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 font-semibold">Video Score</h4>
                      <div className="text-3xl font-semibold text-[#7C3AED] leading-none">84<span className="text-sm font-normal text-gray-400">/100</span></div>
                      <Tag label="✓ Strong Pass" variant="green" className="mt-1 text-[10px] py-0.5" />
                    </div>
                    <div className="text-xs text-gray-600 leading-relaxed">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 font-semibold">Session Info</h4>
                      Mar 4, 2025 · 32 min · 5 questions<br/>AI + human review · HD recorded
                    </div>
                  </div>

                  {/* Video Mock */}
                  <div 
                    onClick={() => openVideoModal('priya')} 
                    className="relative cursor-pointer group bg-slate-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-gray-800"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/20 border border-white/40 flex items-center justify-center transition-all group-hover:bg-[#387DFF]/70 group-hover:border-[#387DFF]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" className="ml-0.5">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                    <div className="absolute bottom-2.5 left-3 text-[10px] text-white/70">
                      Priya Sharma – Full Session · 32:07 · Mar 4, 2025
                    </div>
                    <div className="absolute top-2.5 right-3 bg-black/60 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                      Score: 84/100
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Question-by-Question</h4>
                    {[
                      { label: 'Q1: Describe your most significant epidemiological investigation', val: 91, text: 'Outstanding. Described Rift Valley Fever cluster investigation in Nakuru County — specific, detailed, methodologically sound.', color: 'bg-[#0047CC]' },
                      { label: 'Q2: How do you handle conflicting surveillance data across sites?', val: 87, text: 'Clear data reconciliation framework described with real DHIS2 example. Acknowledged limits of passive surveillance.', color: 'bg-[#0047CC]' },
                      { label: 'Q3: What global health surveillance systems do you have experience with?', val: 89, text: 'Named WHO GOARN, GHSA, AfricaCDC IDSR, DHIS2, EpiInfo, OpenMRS. Deep operational familiarity evident.', color: 'bg-[#0047CC]' },
                      { label: 'Q4: How would you approach building capacity in a weak surveillance system?', val: 76, text: 'Competent but slightly formulaic. Answer relied on standard WHO APSED/IDSR frameworks without enough local adaptation.', color: 'bg-[#2CA62C]' },
                      { label: 'Q5: Why GlobalHealth Corp and this role specifically?', val: 78, text: 'Adequate research conducted on the organisation. Slightly generic motivation.', color: 'bg-[#2CA62C]' }
                    ].map((item) => (
                      <div key={item.label} className="text-xs">
                        <div className="flex justify-between font-bold mb-1">
                          <span className="text-gray-800">{item.label}</span>
                          <span className="text-gray-900">{item.val}/100</span>
                        </div>
                        <div className="h-2 bg-gray-150 rounded-full overflow-hidden mb-1">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.val}%` }}></div>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-normal">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {priyaTab === 'overall' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="bg-[#EBF6FF] border border-[#387DFF]/20 rounded-xl p-3 flex flex-col items-center">
                      <h5 className="text-[10px] font-bold text-gray-500 uppercase mb-1">Psychometric</h5>
                      <div className="text-xl font-semibold text-[#0047CC] mb-1">91</div>
                      <Tag label="Exceptional" variant="blue" className="text-[9px] py-0 px-2" />
                    </div>
                    <div className="bg-[#EEFBEE] border border-[#2CA62C]/20 rounded-xl p-3 flex flex-col items-center">
                      <h5 className="text-[10px] font-bold text-gray-500 uppercase mb-1">SJT</h5>
                      <div className="text-xl font-semibold text-[#2CA62C] mb-1">86</div>
                      <Tag label="Pass" variant="green" className="text-[9px] py-0 px-2" />
                    </div>
                    <div className="bg-[#F5F3FF] border border-[#7C3AED]/20 rounded-xl p-3 flex flex-col items-center">
                      <h5 className="text-[10px] font-bold text-gray-500 uppercase mb-1">Video</h5>
                      <div className="text-xl font-semibold text-[#7C3AED] mb-1">84</div>
                      <Tag label="Pass" variant="purple" className="text-[9px] py-0 px-2" />
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-150 rounded-xl p-4">
                    <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Composite Score</h5>
                    <div className="text-2xl font-semibold text-gray-900">88 <span className="text-xs font-normal text-gray-400">/ 100 composite</span></div>
                    <p className="text-[10px] text-gray-500 mt-0.5">Weighted: Psychometric 35% · SJT 40% · Video 25%</p>
                  </div>

                  <div className="p-3 bg-[#EEFBEE] border border-[#2CA62C]/20 rounded-xl text-xs text-[#135813] leading-relaxed">
                    <strong>VORA recommendation:</strong> Priya Sharma is an exceptional candidate — composite 88/100, ranking in the top 8% of all epidemiologists assessed on VORA. Her psychometric scores reflect rare analytical capacity.
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {priyaStatus === 'pending' && (
              <div className="p-4 bg-gray-50 border-t border-gray-150 flex justify-end gap-3 flex-wrap sm:flex-nowrap">
                <Button 
                  variant="outline" 
                  size="sm" 
                  fullWidth={false}
                  onClick={() => openRejectModal('priya')}
                  className="cursor-pointer font-bold shrink-0 text-xs px-4"
                >
                  <CloseIcon size={12} className="mr-1" />
                  Reject with Reason
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  fullWidth={false}
                  onClick={() => openHireModal('priya')}
                  className="cursor-pointer font-bold shrink-0 text-xs px-4 bg-[#0047CC] hover:bg-[#0039A6]"
                >
                  <CheckIcon size={12} className="mr-1" strokeWidth={3} />
                  Hire – Trigger Full Refund
                </Button>
              </div>
            )}
          </div>

          {/* ═══════════ HISTORICAL SECTION ═══════════ */}
          <div className="pt-4 border-t border-gray-200">
            <Subheading className="text-base mb-1">Historical Alignment Sessions</Subheading>
            <p className="text-xs text-gray-500 mb-4">Past decisions, outcomes, refunds, forfeitures, and flags — with full assessment detail</p>

            {/* Collapse Item 1: Yusuf Ibrahim */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-3">
              <div 
                onClick={() => toggleHist('yusuf')} 
                className="flex items-center gap-3 p-3.5 cursor-pointer hover:bg-gray-50 transition-colors flex-wrap sm:flex-nowrap"
              >
                <div className="w-9 h-9 rounded-full bg-[#EEFBEE] text-[#1D871D] flex items-center justify-center font-bold text-xs shrink-0">
                  YI
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-xs font-bold text-gray-900">Dr. Yusuf Ibrahim</span>
                    <Tag label="Infectious Disease Specialist" variant="blue" className="text-[9px] py-0.5 font-bold" />
                  </div>
                  <p className="text-[10px] text-gray-500">Hired · Mar 1, 2025 · $150 alignment fee fully refunded · #ALN-2025-0012</p>
                </div>
                <Tag label="Hired · Refunded" variant="green" className="text-[10px] py-0.5 font-bold" />
                <ChevronDownIcon 
                  size={14} 
                  className={`text-gray-400 transition-transform ${expandedHist.yusuf ? 'rotate-180' : ''}`} 
                />
              </div>

              {expandedHist.yusuf && (
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-3 text-xs animate-slideDown">
                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="bg-white border border-gray-150 rounded-lg p-2">
                      <div className="text-[9px] font-bold text-gray-500 uppercase">Psychometric</div>
                      <div className="text-lg font-bold text-[#0047CC]">78</div>
                    </div>
                    <div className="bg-white border border-gray-150 rounded-lg p-2">
                      <div className="text-[9px] font-bold text-gray-500 uppercase">SJT</div>
                      <div className="text-lg font-bold text-[#2CA62C]">80</div>
                    </div>
                    <div className="bg-white border border-gray-150 rounded-lg p-2">
                      <div className="text-[9px] font-bold text-gray-500 uppercase">Video</div>
                      <div className="text-lg font-bold text-[#7C3AED]">76</div>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    <strong className="text-gray-700">Why he passed:</strong> Psychometric showed strong clinical reasoning (82/100) and conscientiousness (79). SJT: correctly managed all 3 infectious disease triage scenarios. Video: presented a compelling narrative on his PEPFAR-funded HIV programme.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    <strong className="text-gray-700">Outcome:</strong> Hired on Mar 1, 2025. Offer letter issued immediately. $150 alignment fee refunded to wallet within 3 minutes of hire confirmation. Final salary declared: $66,000.
                  </p>
                </div>
              )}
            </div>

            {/* Collapse Item 2: Kofi Mensah */}
            <div className="bg-white border border-red-200 rounded-xl overflow-hidden mb-3">
              <div 
                onClick={() => toggleHist('kofi')} 
                className="flex items-center gap-3 p-3.5 cursor-pointer hover:bg-gray-50 transition-colors flex-wrap sm:flex-nowrap"
              >
                <div className="w-9 h-9 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center font-bold text-xs shrink-0">
                  KM
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-xs font-bold text-gray-900">Dr. Kofi Mensah</span>
                    <Tag label="Biostatistician" variant="red" className="text-[9px] py-0.5 font-bold" />
                  </div>
                  <p className="text-[10px] text-[#DC2626]">⚠ Rejected · Fee Forfeited · Account Flagged (1/3) · Feb 25, 2025</p>
                </div>
                <Tag label="Forfeited · Flagged" variant="red" className="text-[10px] py-0.5 font-bold" />
                <ChevronDownIcon 
                  size={14} 
                  className={`text-gray-400 transition-transform ${expandedHist.kofi ? 'rotate-180' : ''}`} 
                />
              </div>

              {expandedHist.kofi && (
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-3 text-xs animate-slideDown">
                  <div className="flex gap-2.5 bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-3 text-[#DC2626] leading-normal">
                    <AlertTriangleIcon size={14} className="text-[#DC2626] shrink-0 mt-0.5" />
                    <div>
                      <strong>VORA determination:</strong> Rejection reason "Personal fit" was deemed invalid without supporting documentation. $150 fee forfeited. Candidate Dr. Kofi Mensah compensated. 1 of 3 warnings issued.
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="bg-white border border-gray-150 rounded-lg p-2 flex flex-col items-center">
                      <div className="text-[9px] font-bold text-gray-500 uppercase mb-1">Psychometric</div>
                      <div className="text-lg font-bold text-[#0047CC] mb-1">83</div>
                      <Tag label="Pass" variant="blue" className="text-[9px] py-0 px-2" />
                    </div>
                    <div className="bg-white border border-gray-150 rounded-lg p-2 flex flex-col items-center">
                      <div className="text-[9px] font-bold text-gray-500 uppercase mb-1">SJT</div>
                      <div className="text-lg font-bold text-[#DC2626] mb-1">77</div>
                      <Tag label="Below 80" variant="red" className="text-[9px] py-0 px-2" />
                    </div>
                    <div className="bg-white border border-gray-150 rounded-lg p-2 flex flex-col items-center">
                      <div className="text-[9px] font-bold text-gray-500 uppercase mb-1">Video</div>
                      <div className="text-lg font-bold text-[#DC2626] mb-1">74</div>
                      <Tag label="Below 80" variant="red" className="text-[9px] py-0 px-2" />
                    </div>
                  </div>

                  <p className="text-gray-600 leading-relaxed">
                    <strong className="text-gray-700">Assessment result:</strong> Psychometric 83/100 — passed. SJT 77/100 — below threshold. Video 74/100 — below threshold. Rejection on undocumented "personal fit" grounds was reviewed as invalid.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    <strong className="text-gray-700">Employer rejection reason:</strong> "Personal fit — not the right cultural match for our team."<br/>
                    <strong className="text-gray-700">VORA review:</strong> Reason is subjective, unsubstantiated. Fee of $150 forfeited to VORA. Candidate compensated. Account flagged.
                  </p>
                </div>
              )}
            </div>

            {/* Collapse Item 3: Adaeze Nwosu */}
            <div className="bg-white border border-[#2CA62C]/30 rounded-xl overflow-hidden mb-3">
              <div 
                onClick={() => toggleHist('adaeze')} 
                className="flex items-center gap-3 p-3.5 cursor-pointer hover:bg-gray-50 transition-colors flex-wrap sm:flex-nowrap"
              >
                <div className="w-9 h-9 rounded-full bg-[#FFFBEB] text-[#92400E] flex items-center justify-center font-bold text-xs shrink-0">
                  AN
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-xs font-bold text-gray-900">Dr. Adaeze Nwosu</span>
                    <Tag label="Maternal Health Specialist" variant="yellow" className="text-[9px] py-0.5 font-bold" />
                  </div>
                  <p className="text-[10px] text-gray-500">Rejected · Valid reason · $150 fully refunded · Feb 14, 2025 · #ALN-2025-0007</p>
                </div>
                <Tag label="Rejected · Refunded" variant="gray" className="text-[10px] py-0.5 font-bold" />
                <ChevronDownIcon 
                  size={14} 
                  className={`text-gray-400 transition-transform ${expandedHist.adaeze ? 'rotate-180' : ''}`} 
                />
              </div>

              {expandedHist.adaeze && (
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-3 text-xs animate-slideDown">
                  <div className="flex gap-2.5 bg-[#EEFBEE] border border-[#2CA62C]/20 rounded-lg p-3 text-[#135813] leading-normal">
                    <CheckIcon size={14} className="text-[#2CA62C] shrink-0 mt-0.5" strokeWidth={3} />
                    <div>
                      <strong>VORA determination:</strong> Rejection accepted as valid. Documented evidence confirmed the candidate\'s salary expectation ($72,000) exceeded the budgeted ceiling ($64,000) — a factual mismatch. $150 refunded.
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="bg-white border border-gray-150 rounded-lg p-2 flex flex-col items-center">
                      <div className="text-[9px] font-bold text-gray-500 uppercase mb-1">Psychometric</div>
                      <div className="text-lg font-bold text-[#DC2626] mb-1">76</div>
                      <Tag label="Below 80" variant="red" className="text-[9px] py-0 px-2" />
                    </div>
                    <div className="bg-white border border-gray-150 rounded-lg p-2 flex flex-col items-center">
                      <div className="text-[9px] font-bold text-gray-500 uppercase mb-1">SJT</div>
                      <div className="text-lg font-bold text-[#DC2626] mb-1">72</div>
                      <Tag label="Below 80" variant="red" className="text-[9px] py-0 px-2" />
                    </div>
                    <div className="bg-white border border-gray-150 rounded-lg p-2 flex flex-col items-center">
                      <div className="text-[9px] font-bold text-gray-500 uppercase mb-1">Video</div>
                      <div className="text-lg font-bold text-[#DC2626] mb-1">73</div>
                      <Tag label="Below 80" variant="red" className="text-[9px] py-0 px-2" />
                    </div>
                  </div>

                  <p className="text-gray-600 leading-relaxed">
                    <strong className="text-gray-700">Context:</strong> Dr. Nwosu scored below the threshold on all assessments. Rejection was on salary grounds, which is a valid documented reason. Factual constraint mismatch was documented.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Summaries & Policies */}
        <div className="space-y-4 lg:sticky lg:top-5">
          {/* Card 1: Alignment Fees Summary */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <h4 className="text-xs font-bold text-gray-900">Alignment Fees Summary</h4>
            </div>
            <div className="p-4 space-y-2.5 text-xs text-gray-600">
              <div className="flex justify-between font-medium">
                <span>Dr. Amara Osei</span>
                <span className="font-bold text-[#D97706]">{amaraStatus === 'pending' ? '$150.00' : '$0.00'}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Priya Sharma</span>
                <span className="font-bold text-[#D97706]">{priyaStatus === 'pending' ? '$150.00' : '$0.00'}</span>
              </div>
              <div className="flex justify-between pt-2.5 border-t-2 border-gray-100 font-bold text-gray-900">
                <span>Total held</span>
                <span className="text-[#D97706] text-sm">${totalHeldAmount.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed pt-1">
                Both hired → <strong className="text-[#1D871D]">$300 refunded</strong><br/>
                Both rejected valid → refunded<br/>
                Both rejected invalid → <strong className="text-[#DC2626]">$300 forfeited + 2 warnings</strong>
              </p>
            </div>
          </div>

          {/* Card 2: Refund Policy */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <h4 className="text-xs font-bold text-gray-900">Refund Policy</h4>
            </div>
            <div className="p-4 space-y-4 text-xs">
              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#EEFBEE] text-[#1D871D] flex items-center justify-center shrink-0">
                  <CheckIcon size={10} strokeWidth={3} />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Hire</div>
                  <div className="text-[10px] text-gray-500">$150 auto-refunded instantly</div>
                </div>
              </div>
              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#EEFBEE] text-[#1D871D] flex items-center justify-center shrink-0">
                  <CheckIcon size={10} strokeWidth={3} />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Reject – valid, documented</div>
                  <div className="text-[10px] text-gray-500">VORA reviews within 2 days · Refund if valid</div>
                </div>
              </div>
              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0">
                  <CloseIcon size={10} />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Reject – no valid reason</div>
                  <div className="text-[10px] text-gray-500">Fee forfeited · Account warning issued</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Valid Rejection Reasons */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <h4 className="text-xs font-bold text-gray-900">Valid Rejection Reasons</h4>
            </div>
            <div className="p-4 text-xs text-gray-500 leading-loose">
              ✓ Qualifications don't meet spec<br/>
              ✓ Salary expectations exceed budget<br/>
              ✓ Location / availability conflict<br/>
              ✓ Role scope mismatch (documented)<br/>
              ✓ Candidate withdrew<br/>
              <span className="text-[#DC2626] font-semibold">✗ "Personal fit" (undocumented)</span><br/>
              <span className="text-[#DC2626] font-semibold">✗ "Not what we expected"</span><br/>
              <span className="text-[#DC2626] font-semibold">✗ Any subjective, unsubstantiated reason</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ MODAL: HIRE ═══════════ */}
      {hireModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[480px] p-6 shadow-xl relative animate-scaleIn">
            <div className="flex items-start justify-between gap-4 mb-4">
              <CardTitle className="text-base">Confirm Hire</CardTitle>
              <button 
                onClick={() => setHireModalOpen(false)}
                className="w-7 h-7 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2.5 bg-[#EEFBEE] border border-[#2CA62C]/20 rounded-xl p-3 text-[#135813] text-xs leading-normal">
                <CheckIcon size={14} className="text-[#2CA62C] shrink-0 mt-0.5" strokeWidth={3} />
                <div>
                  Hiring will <strong>auto-refund the full alignment fee</strong> to your wallet immediately and release the offer letter.
                </div>
              </div>

              <div className="text-xs space-y-1 text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-150">
                <div><strong>Candidate:</strong> {hireTarget === 'amara' ? 'Dr. Amara Osei' : 'Priya Sharma'}</div>
                <div><strong>Reference:</strong> #{hireTarget === 'amara' ? 'ALN-2025-0015' : 'ALN-2025-0014'}</div>
                <div><strong>Alignment fee:</strong> $150.00 → refunded on confirmation</div>
              </div>

              <div className="space-y-1.5">
                <Input 
                  label="Declare final accepted salary (required for escrow true-up)"
                  type="number"
                  placeholder="Enter final accepted salary (e.g. 68000)"
                  value={tempSalary}
                  onChange={(e) => setTempSalary(e.target.value)}
                />
                <p className="text-[10px] text-gray-500">
                  Must be within the declared range. True-up or credit will fire automatically within 24 hours.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" size="sm" fullWidth={false} onClick={() => setHireModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" fullWidth={false} onClick={confirmHire} className="bg-[#0047CC] hover:bg-[#0039A6]">
                  Confirm Hire &amp; Refund
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL: REJECT ═══════════ */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[500px] p-6 shadow-xl relative animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-4">
              <CardTitle className="text-base">Reject with Reason</CardTitle>
              <button 
                onClick={() => setRejectModalOpen(false)}
                className="w-7 h-7 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-3 text-[#92400E] text-xs leading-normal">
                <AlertTriangleIcon size={14} className="text-[#D97706] shrink-0 mt-0.5" />
                <div>
                  A valid documented reason is required for refund. VORA reviews within 2 business days. <strong>$150.00</strong> is forfeited if reason is invalid or undocumented.
                </div>
              </div>

              <div className="text-xs font-semibold text-gray-800">
                Rejection reason for <span className="text-[#0047CC] font-bold">{rejectTarget === 'amara' ? 'Dr. Amara Osei' : 'Priya Sharma'}</span>:
              </div>

              <div className="space-y-2">
                {[
                  { value: 'qual', title: "Qualifications don't meet requirements", desc: "Missing required certifications or seniority level" },
                  { value: 'salary', title: "Salary expectation exceeds budget", desc: "Stated compensation is above approved ceiling (attach budget doc)" },
                  { value: 'location', title: "Location or availability conflict", desc: "Candidate cannot meet location/time zone requirements" },
                  { value: 'scope', title: "Role scope mismatch (documented)", desc: "Specific technical specialism not aligned with requirements" },
                  { value: 'withdrew', title: "Candidate withdrew", desc: "Candidate declined to proceed" },
                  { value: 'other', title: "Other (requires detailed written justification)", desc: "High bar — VORA will review closely" }
                ].map(opt => (
                  <label 
                    key={opt.value} 
                    className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-[#387DFF] hover:bg-[#EBF6FF]/40 transition-all"
                  >
                    <input autoComplete="off" 
                      type="radio" 
                      name="rr" 
                      value={opt.value}
                      checked={rejectReason === opt.value}
                      onChange={() => setRejectReason(opt.value)}
                      className="mt-0.5 accent-[#0047CC]" 
                    />
                    <div>
                      <div className="text-xs font-bold text-gray-900">{opt.title}</div>
                      <div className="text-[10px] text-gray-500">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <Textarea 
                label='Supporting notes (required for "Other" · recommended for all)'
                placeholder="Provide specific, factual details…" 
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                className="min-h-[75px] text-xs font-semibold"
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" size="sm" fullWidth={false} onClick={() => setRejectModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" fullWidth={false} onClick={confirmReject} className="bg-[#DC2626] hover:bg-[#B91C1C]">
                  Submit Rejection
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL: VIDEO PLAYBACK ═══════════ */}
      {videoModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[640px] p-6 shadow-xl relative animate-scaleIn">
            <div className="flex items-start justify-between gap-4 mb-4">
              <CardTitle className="text-base">
                {videoTarget === 'amara' ? 'Dr. Amara Osei' : 'Priya Sharma'} – Video Interview
              </CardTitle>
              <button 
                onClick={() => setVideoModalOpen(false)}
                className="w-7 h-7 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-950 rounded-xl aspect-video flex flex-col items-center justify-center gap-3 border border-gray-800 text-center p-4">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/25">
                  <VideoIcon size={28} className="text-white" />
                </div>
                <div className="text-sm font-semibold text-white/90">
                  Video playback simulation in progress
                </div>
                <div className="text-xs text-white/50">
                  {videoTarget === 'amara' 
                    ? 'Dr. Amara Osei – Public Health Advisor · Mar 3, 2025 · 28:14' 
                    : 'Priya Sharma – Senior Epidemiologist · Mar 4, 2025 · 32:07'
                  }
                </div>
              </div>

              <div className="p-3 bg-[#EBF6FF] border border-[#387DFF]/25 rounded-xl text-xs text-[#1e40af] leading-relaxed">
                This recording is confidential and accessible only to authorised VORA employer accounts. All access is audit-logged.
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary" size="sm" fullWidth={false} onClick={() => setVideoModalOpen(false)}>
                  Close Playback
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
