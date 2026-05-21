import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import Input from '../common/Input';
import type { PostJobModalProps } from '../../types';

const PostJobModal: React.FC<PostJobModalProps> = ({ isOpen, onClose, onContinue }) => {
  const [hireMode, setHireMode] = useState<'live' | 'vault' | null>(null);
  const [goLiveDate, setGoLiveDate] = useState('');
  const [fillMethod, setFillMethod] = useState<'upload' | 'manual' | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [documentLink, setDocumentLink] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetModal = () => {
    setHireMode(null);
    setGoLiveDate('');
    setFillMethod(null);
    setUploadedFile(null);
    setDocumentLink('');
    setIsDragging(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      setUploadedFile({
        name: file.name,
        size: `${sizeInMB}MB`
      });
      toast.success('Job description document loaded');
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      setUploadedFile({
        name: file.name,
        size: `${sizeInMB}MB`
      });
      toast.success('Job description document dropped');
    }
  };

  const isMethodSectionVisible = hireMode === 'live' || (hireMode === 'vault' && goLiveDate !== '');

  const getButtonState = () => {
    if (!hireMode) {
      return { disabled: true, text: 'Continue' };
    }
    if (hireMode === 'vault' && !goLiveDate) {
      return { disabled: true, text: 'Set a go-live date to continue' };
    }
    if (!fillMethod) {
      return { disabled: true, text: 'Choose how to fill in the role' };
    }
    if (fillMethod === 'upload') {
      const hasFile = uploadedFile !== null;
      const hasLink = documentLink.trim().length > 0;
      if (!hasFile && !hasLink) {
        return { disabled: true, text: 'Upload a file or paste a link to continue' };
      }
      return { disabled: false, text: 'Continue with uploaded document →' };
    }
    // Manual mode
    if (hireMode === 'vault') {
      return { disabled: false, text: 'Start filling in scheduled role →' };
    }
    return { disabled: false, text: 'Start filling in role details →' };
  };

  const buttonState = getButtonState();

  const handleProceed = () => {
    const isScheduled = hireMode === 'vault';
    const isPrefilled = fillMethod === 'upload';

    try {
      if (isScheduled) {
        sessionStorage.setItem('voraScheduledMode', '1');
        if (goLiveDate) sessionStorage.setItem('voraGoLive', goLiveDate);
      } else {
        sessionStorage.removeItem('voraScheduledMode');
        sessionStorage.removeItem('voraGoLive');
      }
      sessionStorage.setItem('voraPostMode', isPrefilled ? 'upload' : 'manual');
    } catch (e) {
      console.error(e);
    }

    if (onContinue) {
      onContinue({
        isScheduled,
        goLiveDate: isScheduled ? goLiveDate : '',
        isPrefilled,
      });
    }
    resetModal();
  };

  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Overlay Background */}
      <div className="absolute inset-0 bg-[#000]/50 backdrop-blur-xs" onClick={resetModal} />

      {/* Modal Content container */}
      <div className="relative bg-white w-full sm:max-w-[520px] max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col scrollbar-hide fixed bottom-0 sm:relative">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between z-10">
          <h2 className="text-[18px] font-extrabold text-gray-900 tracking-tight">Post a Job</h2>
          <button 
            onClick={resetModal} 
            className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* STEP 1: When do you want to hire? */}
          <div className="space-y-3">
            <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
              When do you want to hire?
            </div>

            <div className="space-y-2">
              {/* Option 1: Live Now */}
              <div 
                onClick={() => {
                  setHireMode('live');
                  setFillMethod(null);
                  setUploadedFile(null);
                  setDocumentLink('');
                }}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all bg-white hover:border-gray-300 ${
                  hireMode === 'live' ? 'border-[#0047CC] bg-[#EBF6FF]/30' : 'border-gray-200'
                }`}
              >
                <div className="flex gap-3 items-start">
                  <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    hireMode === 'live' ? 'border-[#0047CC]' : 'border-gray-300'
                  }`}>
                    {hireMode === 'live' && <div className="w-2.5 h-2.5 rounded-full bg-[#0047CC]" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Post live now</h3>
                    <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">
                      Role goes live immediately on submission. Matching fires the same day.
                    </p>
                  </div>
                </div>
              </div>

              {/* Option 2: Vault Mode */}
              <div 
                onClick={() => {
                  setHireMode('vault');
                  setFillMethod(null);
                  setUploadedFile(null);
                  setDocumentLink('');
                }}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all bg-white hover:border-gray-300 ${
                  hireMode === 'vault' ? 'border-[#0047CC] bg-[#EBF6FF]/30' : 'border-gray-200'
                }`}
              >
                <div className="flex gap-3 items-start">
                  <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    hireMode === 'vault' ? 'border-[#0047CC]' : 'border-gray-300'
                  }`}>
                    {hireMode === 'vault' && <div className="w-2.5 h-2.5 rounded-full bg-[#0047CC]" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0047CC" strokeWidth="2.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                      Schedule for later — Vault mode
                    </h3>
                    <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">
                      Not hiring right now? Set a future go-live date. Your fee rate locks in today. The role stays completely invisible — but VORA silently matches every new candidate who joins against your specification. On go-live day, qualified candidates are notified instantly.
                    </p>
                  </div>
                </div>

                {/* Go-live date sub-pane */}
                {hireMode === 'vault' && (
                  <div 
                    onClick={(e) => e.stopPropagation()} 
                    className="mt-3 p-4 bg-[#EBF6FF] border border-[#BDD9FF] rounded-lg text-left"
                  >
                    <label className="block text-[11px] font-extrabold text-[#0047CC] uppercase tracking-wider mb-2">
                      Go-live date <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      label=""
                      type="date" 
                      value={goLiveDate} 
                      onChange={(e) => setGoLiveDate(e.target.value)} 
                      className="border-[#BDD9FF] focus:border-[#0047CC] cursor-pointer"
                    />
                    <p className="text-[11px] text-[#1e3a8a] mt-3.5 leading-relaxed">
                      Role stays completely invisible until this exact date. No candidate knows it exists. During the vault period, every new candidate who joins VORA and completes onboarding is silently matched against your specification. Those who score 80% or above are pre-qualified internally — they are not told, not contacted. On go-live day, matching fires publicly for the first time and pre-qualified candidates are notified instantly. You can see how many VORA candidates currently qualify at any time.
                    </p>
                    <div className="mt-3 text-[11px] text-[#1e3a8a] leading-relaxed bg-white/70 rounded-lg p-3 space-y-1">
                      <div>① Complete the full role posting form below — same as a live role.</div>
                      <div>② On the preview screen you confirm your go-live date and pay escrow.</div>
                      <div>③ Role enters Vault. Fee rate locked at today's rate regardless of future repricing.</div>
                      <div>④ Edit the spec up to 3 times before go-live (48hr review per edit).</div>
                      <div>⑤ Cancel before 24hrs of go-live for a full wallet refund.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STEP 2: How would you like to fill in the role details? */}
          {isMethodSectionVisible && (
            <div className="pt-6 border-t border-gray-200 space-y-3 animate-in slide-in-from-top-2 duration-300">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                How would you like to fill in the role details?
              </div>

              <div className="space-y-2">
                {/* Method 1: Upload */}
                <div 
                  onClick={() => setFillMethod('upload')}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all bg-white hover:border-gray-300 ${
                    fillMethod === 'upload' ? 'border-[#0047CC] bg-[#EBF6FF]/30' : 'border-gray-200'
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      fillMethod === 'upload' ? 'border-[#0047CC]' : 'border-gray-300'
                    }`}>
                      {fillMethod === 'upload' && <div className="w-2.5 h-2.5 rounded-full bg-[#0047CC]" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-gray-900">Upload job document</h3>
                      <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">
                        Upload your existing JD — VORA extracts and pre-fills all role details for you to review step by step.
                      </p>
                    </div>
                  </div>

                  {/* Dropzone sub-pane */}
                  {fillMethod === 'upload' && (
                    <div onClick={(e) => e.stopPropagation()} className="mt-4 space-y-3.5">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept=".pdf,.docx" 
                        className="hidden" 
                      />
                      
                      <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                          isDragging ? 'border-[#0047CC] bg-[#EBF6FF]/40' : 'border-gray-200 hover:border-[#0047CC] hover:bg-[#EBF6FF]/20'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center">
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0047CC" strokeWidth="1.8">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="12" y1="18" x2="12" y2="12" />
                            <line x1="9" y1="15" x2="15" y2="15" />
                          </svg>
                          <div className="text-[13px] font-bold text-gray-700 mt-2">
                            Drop PDF or DOCX here, or click to browse
                          </div>
                          <div className="text-[11px] text-gray-400 mt-1">
                            PDF, DOCX only — Max 10 MB
                          </div>
                        </div>
                      </div>

                      {/* File item preview */}
                      {uploadedFile && (
                        <div className="flex items-center gap-2 bg-[#EEFBEE] border border-[#85E585] rounded-lg p-2.5 mt-2">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1D871D" strokeWidth="2.5" className="shrink-0">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span className="text-[13px] font-bold text-[#135813] flex-1 truncate">
                            {uploadedFile.name}
                          </span>
                          <span className="text-[11px] text-gray-500 shrink-0">
                            {uploadedFile.size}
                          </span>
                          <button 
                            onClick={handleRemoveFile}
                            className="p-1 hover:bg-green-100 rounded text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      )}

                      {/* URL input section */}
                      <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest my-3.5 before:h-px before:bg-gray-200 before:flex-1 after:h-px after:bg-gray-200 after:flex-1">
                        or paste a link
                      </div>

                      <Input 
                        label=""
                        type="url" 
                        placeholder="https://yourorg.com/job-description or Google Doc URL"
                        value={documentLink}
                        onChange={(e) => setDocumentLink(e.target.value)}
                        className="border-gray-200 focus:border-[#0047CC]"
                      />
                    </div>
                  )}
                </div>

                {/* Method 2: Manual */}
                <div 
                  onClick={() => setFillMethod('manual')}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all bg-white hover:border-gray-300 ${
                    fillMethod === 'manual' ? 'border-[#0047CC] bg-[#EBF6FF]/30' : 'border-gray-200'
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      fillMethod === 'manual' ? 'border-[#0047CC]' : 'border-gray-300'
                    }`}>
                      {fillMethod === 'manual' && <div className="w-2.5 h-2.5 rounded-full bg-[#0047CC]" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Fill out manually</h3>
                      <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">
                        Start from scratch and complete all steps yourself.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action button */}
          <Button
            disabled={buttonState.disabled}
            onClick={handleProceed}
            variant="primary"
            fullWidth={true}
            pill={true}
            size="lg"
            className="mt-4"
          >
            {buttonState.text}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostJobModal;
