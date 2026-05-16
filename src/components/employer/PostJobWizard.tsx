import React, { useState, useEffect } from 'react';
import { 
  CloseIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CheckIcon,
  InfoIcon,
  BriefcaseIcon,
  TrendingUpIcon
} from '../common/Icons';
import Select from '../common/Select';
import Button from '../common/Button';
import Input from '../common/Input';

interface PostJobWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  { id: 1, title: 'Role Details', sub: 'Title, level & location' },
  { id: 2, title: 'Responsibilities', sub: 'What they will do' },
  { id: 3, title: 'Experience', sub: 'Background & skills' },
  { id: 4, title: 'Team & Communication', sub: 'Culture & style' },
  { id: 5, title: 'Compensation', sub: 'Budget & benefits' },
  { id: 6, title: 'Preview & Post', sub: 'Final review' }
];

const PostJobWizard: React.FC<PostJobWizardProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isClosing, setIsClosing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    roleTitle: '',
    roleType: 'Internship',
    level: 'Entry Level',
    positions: '1',
    format: 'Remote',
    location: '',
    startDate: '',
    endDate: '',
    summary: '',
    responsibilities: '',
    skills: [] as string[],
    newSkill: '',
    academicLevel: 'Bachelor\'s Degree',
    experienceYears: '0-1 year',
    language: 'English',
    payType: 'Fixed',
    currency: 'USD',
    minPay: '',
    maxPay: '',
    benefits: [] as string[]
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setCurrentStep(1);
    }, 400);
  };

  if (!isOpen && !isClosing) return null;

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 6));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const addSkill = () => {
    if (formData.newSkill.trim() && !formData.skills.includes(formData.newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, formData.newSkill.trim()],
        newSkill: ''
      });
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    });
  };

  return (
    <div className={`fixed inset-0 z-[200] flex flex-col bg-[#F7F7F7] transition-all duration-500 ease-in-out ${isClosing ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
      {/* Top Header */}
      <div className="h-[72px] bg-white border-b border-gray-100 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-[#0047CC] rounded-lg flex items-center justify-center">
            <BriefcaseIcon size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-[16px] font-medium text-gray-900 tracking-tight leading-none">Post a Job</h2>
            <p className="text-[11px] font-medium text-gray-400 mt-1">Draft saved automatically</p>
          </div>
        </div>
        <button 
          onClick={handleClose}
          className="w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-colors group cursor-pointer"
        >
          <CloseIcon size={24} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Steps */}
        <div className="w-[320px] bg-white border-r border-gray-100 p-8 hidden lg:flex flex-col">
          <div className="space-y-8">
            {STEPS.map((step) => (
              <div key={step.id} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-medium transition-all duration-300 ${
                    currentStep === step.id 
                      ? 'bg-[#0047CC] text-white shadow-lg shadow-blue-500/30' 
                      : currentStep > step.id 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-50 text-gray-400 border border-gray-100'
                  }`}>
                    {currentStep > step.id ? <CheckIcon size={14} /> : step.id}
                  </div>
                  {step.id !== 6 && (
                    <div className={`w-0.5 h-10 my-1 rounded-full ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-50'}`} />
                  )}
                </div>
                <div className="pt-0.5">
                  <p className={`text-[14px] font-medium tracking-tight ${currentStep === step.id ? 'text-[#0047CC]' : 'text-gray-900 opacity-60'}`}>
                    {step.title}
                  </p>
                  <p className="text-[11px] font-medium text-gray-400 mt-0.5">{step.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
            <div className="flex gap-3">
              <InfoIcon size={16} className="text-[#0047CC] shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium text-[#0047CC] leading-relaxed">
                Tip: Clearer job descriptions attract 40% more qualified candidates. Be specific about the goals.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-white lg:bg-transparent">
          <div className="max-w-3xl mx-auto py-12 px-6 lg:px-12">
            
            {/* Step 1: Role Details */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <span className="bg-blue-50 text-[#0047CC] text-[10px] font-medium uppercase tracking-widest px-2 py-0.5 rounded">Step 01</span>
                  <h3 className="text-[28px] font-medium text-gray-900 tracking-tight leading-tight">Tell us about the role</h3>
                  <p className="text-[14px] font-medium text-gray-400">Provide basic information to help candidates find your job.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Role Title"
                    name="roleTitle"
                    placeholder="e.g. Public Health Research Intern"
                    value={formData.roleTitle}
                    onChange={(e) => setFormData({...formData, roleTitle: e.target.value})}
                  />
                  <Select 
                    label="Role Type"
                    name="roleType"
                    value={formData.roleType}
                    onChange={(e) => setFormData({...formData, roleType: e.target.value})}
                    options={[
                      { label: 'Internship', value: 'Internship' },
                      { label: 'Full-time', value: 'Full-time' },
                      { label: 'Contract', value: 'Contract' },
                      { label: 'Voluntary', value: 'Voluntary' },
                    ]}
                  />
                  <Select 
                    label="Employment Level"
                    name="level"
                    value={formData.level}
                    onChange={(e) => setFormData({...formData, level: e.target.value})}
                    options={[
                      { label: 'Entry Level', value: 'Entry Level' },
                      { label: 'Mid Level', value: 'Mid Level' },
                      { label: 'Senior Level', value: 'Senior Level' },
                      { label: 'Executive', value: 'Executive' },
                    ]}
                  />
                  <Input 
                    label="Number of Positions"
                    type="number"
                    value={formData.positions}
                    onChange={(e) => setFormData({...formData, positions: e.target.value})}
                  />
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[13px] font-medium text-gray-900 mb-8">Work Format & Location</label>
                    <div className="grid grid-cols-3 gap-3 my-4">
                      {['Onsite', 'Remote', 'Hybrid'].map((fmt) => (
                        <Button
                          key={fmt}
                          variant={formData.format === fmt ? 'primary' : 'outline'}
                          onClick={() => setFormData({...formData, format: fmt})}
                          fullWidth={true}
                          className={`min-h-[48px] text-[13px] ${
                            formData.format === fmt 
                              ? 'shadow-lg shadow-blue-500/20' 
                              : 'text-gray-500 border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          {fmt}
                        </Button>
                      ))}
                    </div>
                    {formData.format !== 'Remote' && (
                      <Input 
                        label=""
                        placeholder="City, Country"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                      />
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[13px] font-medium text-gray-900 mb-8">Role Summary</label>
                    <textarea 
                      placeholder="Briefly describe the purpose of this role..."
                      className="w-full px-5 py-4 bg-white border border-gray-100 rounded-xl focus:border-[#0047CC] outline-none text-[14px] font-medium shadow-sm h-32 resize-none mt-4"
                      value={formData.summary}
                      onChange={(e) => setFormData({...formData, summary: e.target.value})}
                    />
                    <p className="text-[11px] font-medium text-gray-400 text-right">0 / 500 characters</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Responsibilities & Skills */}
            {currentStep === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <span className="bg-blue-50 text-[#0047CC] text-[10px] font-medium uppercase tracking-widest px-2 py-0.5 rounded">Step 02</span>
                  <h3 className="text-[28px] font-medium text-gray-900 tracking-tight leading-tight">What will they do?</h3>
                  <p className="text-[14px] font-medium text-gray-400">Define the core responsibilities and technical requirements.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium text-gray-900">Core Responsibilities</label>
                    <textarea 
                      placeholder="Enter responsibilities, one per line..."
                      className="w-full px-5 py-4 mt-4 bg-white border border-gray-100 rounded-xl focus:border-[#0047CC] outline-none text-[14px] font-medium shadow-sm h-48 resize-none"
                      value={formData.responsibilities}
                      onChange={(e) => setFormData({...formData, responsibilities: e.target.value})}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[13px] font-medium text-gray-900">Required Skills</label>
                    <div className="flex gap-2">
                      <Input 
                        label=""
                        placeholder="e.g. Data Analysis, Stata, Python"
                        value={formData.newSkill}
                        onChange={(e) => setFormData({...formData, newSkill: e.target.value})}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <Button 
                        onClick={addSkill}
                        fullWidth={false}
                        variant="outline"
                        className="px-8 text-gray-500 hover:bg-[#0047CC] hover:text-white hover:border-[#0047CC] transition-all shadow-sm"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {formData.skills.map(skill => (
                        <div key={skill} className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg">
                          <span className="text-[12px] font-medium text-[#0047CC]">{skill}</span>
                          <button onClick={() => removeSkill(skill)} className="text-[#0047CC]/50 hover:text-[#0047CC]">
                            <CloseIcon size={12} strokeWidth={3} />
                          </button>
                        </div>
                      ))}
                      {formData.skills.length === 0 && (
                        <p className="text-[12px] font-medium text-gray-300 italic">No skills added yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Preview (Mock for now) */}
            {currentStep > 2 && currentStep < 6 && (
              <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                  <TrendingUpIcon size={40} className="text-gray-300" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-[20px] font-medium text-gray-900 tracking-tight">Step {currentStep} UI In Progress</h3>
                  <p className="text-[14px] font-medium text-gray-400">We're building the specialized inputs for this step.</p>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <span className="bg-green-50 text-green-600 text-[10px] font-medium uppercase tracking-widest px-2 py-0.5 rounded">Final Step</span>
                  <h3 className="text-[28px] font-medium text-gray-900 tracking-tight leading-tight">Preview your job</h3>
                  <p className="text-[14px] font-medium text-gray-400">Last check before you publish to the talent pool.</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-[24px] shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-[#0047CC] to-[#387DFF] p-8 text-white">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] font-medium uppercase tracking-widest text-white/70">Role Posting</span>
                        <h4 className="text-[24px] font-medium tracking-tight">{formData.roleTitle || 'Untitled Role'}</h4>
                        <p className="text-[13px] font-medium text-white/80">{formData.roleType} · {formData.level} · {formData.format}</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <BriefcaseIcon size={24} />
                      </div>
                    </div>
                  </div>
                  <div className="p-8 space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Location</p>
                        <p className="text-[14px] font-medium text-gray-900">{formData.location || 'Remote'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Positions</p>
                        <p className="text-[14px] font-medium text-gray-900">{formData.positions} Available</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Summary</p>
                      <p className="text-[14px] font-medium text-gray-700 leading-relaxed">
                        {formData.summary || 'No summary provided.'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map(skill => (
                          <span key={skill} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[12px] font-medium text-gray-600">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="h-[96px] bg-white border-t border-gray-100 px-8 flex items-center justify-between shrink-0">
        <Button 
          variant="outline"
          fullWidth={false}
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`px-6 min-h-[44px] border-none text-[14px] ${
            currentStep === 1 ? 'text-gray-300' : 'text-gray-900'
          }`}
        >
          <ChevronLeftIcon size={18} /> Back
        </Button>

        <div className="flex items-center gap-4">
          <button className="text-[14px] font-medium text-[#0047CC] hover:underline px-4">
            Save as Draft
          </button>
          <Button 
            onClick={currentStep === 6 ? handleClose : nextStep}
            fullWidth={false}
            className="px-8 min-h-[48px] text-[14px] shadow-lg shadow-blue-500/20"
          >
            {currentStep === 6 ? 'Post Job Now' : 'Continue'}
            {currentStep !== 6 && <ChevronRightIcon size={18} />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostJobWizard;
