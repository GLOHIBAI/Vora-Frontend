import React, { useState } from 'react';
import { 
  CloseIcon, 
  UploadIcon, 
  FileIcon
} from '../common/Icons';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PostJobModal: React.FC<PostJobModalProps> = ({ isOpen, onClose }) => {
  const [hiringMode, setHiringMode] = useState<'live' | 'vault' | null>(null);
  const [goLiveDate, setGoLiveDate] = useState('');
  const [entryMethod, setEntryMethod] = useState<'upload' | 'manual' | null>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'uploaded'>('idle');
  const [documentLink, setDocumentLink] = useState('');

  if (!isOpen) return null;

  const resetModal = () => {
    setHiringMode(null);
    setGoLiveDate('');
    setEntryMethod(null);
    setUploadState('idle');
    setDocumentLink('');
    onClose();
  };

  const isReady = () => {
    if (!hiringMode) return false;
    if (hiringMode === 'vault' && !goLiveDate) return false;
    if (!entryMethod) return false;
    if (entryMethod === 'upload' && uploadState === 'idle' && !documentLink) return false;
    return true;
  };

  const getContinueText = () => {
    if (!hiringMode) return 'Continue';
    if (hiringMode === 'vault' && !goLiveDate) return 'Set a go-live date to continue';
    if (!entryMethod) return 'Choose how to fill in the role';
    if (entryMethod === 'upload' && uploadState === 'idle' && !documentLink) return 'Upload a file or paste a link';
    return entryMethod === 'upload' ? 'Continue with uploaded document →' : 'Start filling in role details →';
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={resetModal} />
      
      <div className="relative bg-white w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-[24px] shadow-2xl animate-in zoom-in-95 duration-500 scrollbar-hide">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
          <h2 className="text-[18px] font-black text-gray-900 font-['Nunito_Sans']">Post a Job</h2>
          <button onClick={resetModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 cursor-pointer">
            <CloseIcon size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* STEP 1: Hiring Mode */}
          <section className="space-y-4">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">When do you want to hire?</p>
            
            <div className="space-y-2">
              <button 
                onClick={() => setHiringMode('live')}
                className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${
                  hiringMode === 'live' ? 'border-[#0047CC] bg-blue-50/50' : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${hiringMode === 'live' ? 'border-[#0047CC]' : 'border-gray-200'}`}>
                  {hiringMode === 'live' && <div className="w-2.5 h-2.5 rounded-full bg-[#0047CC]" />}
                </div>
                <div>
                  <p className="text-[14px] font-black text-gray-900">Post live now</p>
                  <p className="text-[12px] font-bold text-gray-400 mt-0.5">Role goes live immediately on submission. Matching fires the same day.</p>
                </div>
              </button>

              <div className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                hiringMode === 'vault' ? 'border-[#0047CC] bg-blue-50/50' : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}>
                <button 
                  onClick={() => setHiringMode('vault')}
                  className="w-full flex items-start gap-4 cursor-pointer"
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${hiringMode === 'vault' ? 'border-[#0047CC]' : 'border-gray-200'}`}>
                    {hiringMode === 'vault' && <div className="w-2.5 h-2.5 rounded-full bg-[#0047CC]" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-black text-gray-900">Schedule for later — Vault mode</p>
                      <span className="bg-blue-100 text-[#0047CC] text-[9px] font-black px-2 py-0.5 rounded-full">RECOMMENDED</span>
                    </div>
                    <p className="text-[12px] font-bold text-gray-400 mt-0.5 leading-relaxed">
                      Lock in your rate today. VORA silently matches candidates while the role stays invisible until your go-live date.
                    </p>
                  </div>
                </button>

                {hiringMode === 'vault' && (
                  <div className="mt-4 pt-4 border-t border-blue-100 space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                      <label className="text-[12px] font-black text-[#0047CC]">Go-live date *</label>
                      <input 
                        type="date" 
                        className="w-full p-3 bg-white border border-blue-200 rounded-xl outline-none text-[14px] font-bold text-gray-900"
                        value={goLiveDate}
                        onChange={(e) => setGoLiveDate(e.target.value)}
                      />
                    </div>
                    <div className="bg-white/60 p-4 rounded-xl space-y-2">
                      <p className="text-[11px] font-bold text-blue-900 leading-relaxed">
                        ① Complete the full spec today — lock in current fees.<br/>
                        ② Role enters Vault — completely invisible to candidates.<br/>
                        ③ VORA silently pre-qualifies candidates against your spec.<br/>
                        ④ Matching fires publicly on go-live day with zero delay.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* STEP 2: Entry Method (Unfurls) */}
          {(hiringMode === 'live' || (hiringMode === 'vault' && goLiveDate)) && (
            <section className="space-y-4 border-t border-gray-100 pt-8 animate-in slide-in-from-top-4 duration-500">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">How would you like to fill in the role details?</p>
              
              <div className="space-y-3">
                <div className={`p-4 rounded-2xl border-2 transition-all ${
                  entryMethod === 'upload' ? 'border-[#0047CC] bg-blue-50/50' : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}>
                  <button 
                    onClick={() => setEntryMethod('upload')}
                    className="w-full flex items-start gap-4 text-left cursor-pointer"
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${entryMethod === 'upload' ? 'border-[#0047CC]' : 'border-gray-200'}`}>
                      {entryMethod === 'upload' && <div className="w-2.5 h-2.5 rounded-full bg-[#0047CC]" />}
                    </div>
                    <div>
                      <p className="text-[14px] font-black text-gray-900">Upload job document</p>
                      <p className="text-[12px] font-bold text-gray-400 mt-0.5">Upload your existing JD — VORA extracts and pre-fills all role details.</p>
                    </div>
                  </button>

                  {entryMethod === 'upload' && (
                    <div className="mt-4 pt-4 border-t border-blue-100 space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <div 
                        onClick={() => setUploadState('uploaded')}
                        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                          uploadState === 'uploaded' ? 'border-gray-100 bg-white/40' : 'border-blue-100 hover:border-blue-300 bg-white/60'
                        }`}
                      >
                        {uploadState === 'idle' ? (
                          <>
                            <UploadIcon size={24} className="text-[#0047CC]" />
                            <div className="text-center">
                              <p className="text-[13px] font-black text-gray-800">Drop PDF or DOCX here</p>
                              <p className="text-[11px] font-bold text-gray-400 mt-1">or click to browse — Max 10MB</p>
                            </div>
                          </>
                        ) : (
                          <div className="w-full flex items-center gap-4 p-3 bg-white border border-green-100 rounded-xl shadow-sm">
                            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                              <FileIcon size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-black text-gray-900 truncate">Role_Spec_Final.pdf</p>
                              <p className="text-[11px] font-bold text-gray-400">1.4 MB</p>
                            </div>
                            <button className="text-gray-300 hover:text-red-500 p-2" onClick={(e) => { e.stopPropagation(); setUploadState('idle'); }}>
                              <CloseIcon size={14} strokeWidth={3} />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="h-px bg-blue-100 flex-1" />
                        <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">OR</span>
                        <div className="h-px bg-blue-100 flex-1" />
                      </div>

                      <div className="space-y-2">
                        <input 
                          type="url" 
                          placeholder="Paste a link (https://...)" 
                          className="w-full p-3 bg-white border border-blue-100 rounded-xl outline-none text-[13px] font-bold text-gray-900 placeholder:text-gray-300"
                          value={documentLink}
                          onChange={(e) => setDocumentLink(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setEntryMethod('manual')}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${
                    entryMethod === 'manual' ? 'border-[#0047CC] bg-blue-50/50' : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${entryMethod === 'manual' ? 'border-[#0047CC]' : 'border-gray-200'}`}>
                    {entryMethod === 'manual' && <div className="w-2.5 h-2.5 rounded-full bg-[#0047CC]" />}
                  </div>
                  <div>
                    <p className="text-[14px] font-black text-gray-900">Fill out manually</p>
                    <p className="text-[12px] font-bold text-gray-400 mt-0.5">Start from scratch and complete all steps yourself.</p>
                  </div>
                </button>
              </div>
            </section>
          )}

          {/* Action Button */}
          <div className="pt-4 sticky bottom-0 bg-white pb-2">
            <button 
              disabled={!isReady()}
              onClick={() => {
                // Navigate to full wizard or process
                resetModal();
              }}
              className={`w-full py-4 rounded-full text-[15px] font-black transition-all shadow-xl ${
                isReady() ? 'bg-[#0047CC] text-white hover:bg-[#003d99] shadow-blue-500/20' : 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'
              }`}
            >
              {getContinueText()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJobModal;
