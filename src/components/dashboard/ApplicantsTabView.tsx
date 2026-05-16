import React, { useState } from 'react';
import { 
  UsersIcon, 
  CheckIcon, 
  AlertTriangleIcon, 
  ChevronRightIcon, 
  ChevronDownIcon,
  PlayIcon
} from '../common/Icons';

interface ApplicantsTabViewProps {
  onHire: (applicant: any) => void;
  onAlign: (applicant: any) => void;
  onReject: (applicant: any) => void;
}

const ApplicantsTabView: React.FC<ApplicantsTabViewProps> = ({ onHire, onAlign, onReject }) => {
  const [openAccordion, setOpenAccordion] = useState<string | null>('overview');

  const applicants = [
    { code: 'APP-VORA-008', country: 'Ethiopia', city: 'Addis Ababa', psych: 94, sjt: 90, video: 92, overall: 92, status: 'passed' },
    { code: 'APP-VORA-001', country: 'Nigeria', city: 'Lagos', psych: 91, sjt: 88, video: 87, overall: 89, status: 'passed' },
    { code: 'APP-VORA-003', country: 'Ghana', city: 'Accra', psych: 88, sjt: 86, video: 90, overall: 88, status: 'passed' },
    { code: 'APP-VORA-002', country: 'Kenya', city: 'Nairobi', psych: 85, sjt: 92, video: 83, overall: 87, status: 'passed' },
    { code: 'APP-VORA-006', country: 'Tanzania', city: 'Dar es Salaam', psych: 83, sjt: 81, video: 85, overall: 83, status: 'passed' },
    { code: 'APP-VORA-004', country: 'South Africa', city: 'Cape Town', psych: 72, sjt: 65, video: null, overall: 68, status: 'failed' },
    { code: 'APP-VORA-007', country: 'Rwanda', city: 'Kigali', psych: 79, sjt: 80, video: null, overall: 60, status: 'failed' },
    { code: 'APP-VORA-005', country: 'Uganda', city: 'Kampala', psych: 55, sjt: null, video: null, overall: 55, status: 'failed' },
  ];

  const passed = applicants.filter(a => a.status === 'passed');
  const top3 = [...passed].sort((a, b) => b.overall - a.overall).slice(0, 3);

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL MATCHED', value: '8', sub: 'Across 8 countries', icon: UsersIcon, color: 'text-gray-900' },
          { label: 'PASSED ALL TESTS', value: '5', sub: 'Ready for review', icon: CheckIcon, color: 'text-green-600' },
          { label: 'DID NOT MEET THRESHOLD', value: '3', sub: 'Recommended for dev.', icon: AlertTriangleIcon, color: 'text-red-600' },
          { label: 'TOP CANDIDATE', value: 'APP-008', sub: 'Overall score 92%', icon: CheckIcon, color: 'text-[#0047CC]' }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-[14px] p-5 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{stat.label}</p>
            <p className={`text-[24px] font-black ${stat.color} leading-none mb-1`}>{stat.value}</p>
            <p className="text-[11px] font-bold text-gray-400">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Accordions */}
      <div className="space-y-3">
        {/* Pool Overview */}
        <AccordionItem 
          id="overview" 
          title="Candidate Pool Overview" 
          sub="8 candidates matched · International role across 8 countries"
          isOpen={openAccordion === 'overview'}
          onToggle={() => toggleAccordion('overview')}
        >
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-3">
              <p className="text-[13px] font-black text-gray-900">Geographic Distribution</p>
              <div className="space-y-2">
                {['Nigeria', 'Kenya', 'Ghana', 'South Africa', 'Uganda', 'Tanzania', 'Rwanda', 'Ethiopia'].map((c, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0047CC] rounded-full" style={{ width: i === 0 ? '25%' : '12.5%' }} />
                    </div>
                    <span className="text-[12px] font-bold text-gray-600 w-24">{c}</span>
                    <span className="text-[12px] font-black text-gray-400 ml-auto">{i === 0 ? '2' : '1'}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <p className="text-[13px] font-black text-gray-900">Candidate Codes (names concealed)</p>
              <div className="flex flex-wrap gap-2">
                {applicants.map((c, i) => (
                  <span key={i} className={`px-3 py-1.5 rounded-lg border text-[12px] font-black ${c.status === 'passed' ? 'bg-blue-50 text-[#0047CC] border-blue-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                    {c.code}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </AccordionItem>

        {/* Psychometric */}
        <AccordionItem 
          id="psych" 
          title="Psychometric Test Results" 
          sub="6 of 8 passed (≥80%)"
          isOpen={openAccordion === 'psych'}
          onToggle={() => toggleAccordion('psych')}
        >
          <div className="space-y-2">
            {applicants.filter(c => (c.psych ?? 0) >= 80).map((c, i) => (
              <CandidateRow key={i} code={c.code} city={`${c.city}, ${c.country}`} score={c.psych!} description="Demonstrated strong analytical reasoning and cognitive flexibility." />
            ))}
          </div>
        </AccordionItem>

        {/* SJT */}
        <AccordionItem 
          id="sjt" 
          title="Situational Judgement Test Results" 
          sub="6 of 8 passed (≥80%)"
          isOpen={openAccordion === 'sjt'}
          onToggle={() => toggleAccordion('sjt')}
        >
          <div className="space-y-2">
            {applicants.filter(c => (c.sjt ?? 0) >= 80).map((c, i) => (
              <CandidateRow key={i} code={c.code} city={`${c.city}, ${c.country}`} score={c.sjt!} description="Exhibited sound decision-making under complex ethical scenarios." />
            ))}
          </div>
        </AccordionItem>

        {/* Video */}
        <AccordionItem 
          id="video" 
          title="Video Interview/Test Results" 
          sub="5 of 8 passed (≥80%)"
          isOpen={openAccordion === 'video'}
          onToggle={() => toggleAccordion('video')}
        >
          <div className="space-y-2">
            {applicants.filter(c => (c.video ?? 0) >= 80).map((c, i) => (
              <CandidateRow 
                key={i} 
                code={c.code} 
                city={`${c.city}, ${c.country}`} 
                score={c.video!} 
                description="Communicated clearly, showed composure and subject knowledge."
                action={<button className="flex items-center gap-2 px-3 py-1.5 bg-[#0047CC] text-white rounded-lg text-[11px] font-black hover:bg-[#003d99] transition-all cursor-pointer"><PlayIcon size={10} fill="currentColor" /> Watch</button>}
              />
            ))}
          </div>
        </AccordionItem>
      </div>

      {/* VORA Recommendation */}
      <div className="bg-white border-2 border-[#0047CC] rounded-[24px] p-8 mt-10 shadow-xl shadow-blue-500/5">
        <p className="text-[10px] font-black text-[#0047CC] uppercase tracking-[0.1em] mb-2">VORA Recommendation</p>
        <h3 className="text-[18px] font-black text-gray-900 mb-2">Top 3 Candidates</h3>
        <p className="text-[13px] font-bold text-gray-400 mb-8">Ranked by overall performance. Any of the following is qualified for hire.</p>
        
        <div className="space-y-4">
          {top3.map((c, i) => (
            <div key={i} className={`flex flex-col lg:flex-row items-center gap-6 p-6 rounded-[18px] border transition-all ${i === 0 ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-gray-50 border-gray-100'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-[14px] shrink-0 ${i === 0 ? 'bg-[#0047CC] text-white' : 'bg-gray-300 text-white'}`}>
                #{i + 1}
              </div>
              <div className="flex-1 min-w-[120px] text-center lg:text-left">
                <p className="text-[14px] font-black text-gray-900">{c.code}</p>
                <p className="text-[11px] font-bold text-gray-400">{c.city}, {c.country}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <ScoreBadge label="Psych" score={c.psych!} />
                <ScoreBadge label="SJT" score={c.sjt!} />
                <ScoreBadge label="Video" score={c.video!} />
              </div>
              <div className={`text-[24px] font-black min-w-[60px] text-center lg:text-right ${i === 0 ? 'text-[#0047CC]' : 'text-gray-700'}`}>
                {c.overall}%
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <button 
                  onClick={() => onHire(c)}
                  className="px-4 py-2 bg-[#0047CC] text-white rounded-lg text-[12px] font-black hover:bg-[#003d99] transition-all cursor-pointer"
                >
                  Hire
                </button>
                <button 
                  onClick={() => onAlign(c)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-[12px] font-black hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Alignment Session
                </button>
                <button 
                  onClick={() => onReject(c)}
                  className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-[12px] font-black hover:bg-red-50 transition-all cursor-pointer"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AccordionItem: React.FC<{ id: string; title: string; sub: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode }> = ({ title, sub, isOpen, onToggle, children }) => (
  <div className="bg-white border border-gray-100 rounded-[14px] overflow-hidden shadow-sm">
    <button 
      onClick={onToggle}
      className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer text-left"
    >
      <div>
        <p className="text-[14px] font-black text-gray-900">{title}</p>
        <p className="text-[11px] font-bold text-gray-400 mt-0.5">{sub}</p>
      </div>
      <ChevronDownIcon size={20} className={`text-gray-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] border-t border-gray-50 p-6' : 'max-h-0 opacity-0 overflow-hidden'}`}>
      {children}
    </div>
  </div>
);

const CandidateRow: React.FC<{ code: string; city: string; score: number; description: string; action?: React.ReactNode }> = ({ code, city, score, description, action }) => (
  <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
    <span className="text-[13px] font-black text-gray-900 min-w-[80px]">{code}</span>
    <span className="text-[12px] font-bold text-gray-400 min-w-[140px]">{city}</span>
    <div className="bg-green-50 text-green-700 border border-green-100 px-2.5 py-0.5 rounded-full text-[11px] font-black shrink-0">
      {score}%
    </div>
    {action}
    <p className="text-[12px] font-bold text-gray-600 flex-1">{description}</p>
  </div>
);

const ScoreBadge: React.FC<{ label: string; score: number }> = ({ label, score }) => (
  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 border border-green-100 rounded-lg">
    <span className="text-[10px] font-black uppercase opacity-60">{label}</span>
    <span className="text-[11px] font-black">{score}%</span>
  </div>
);

export default ApplicantsTabView;
