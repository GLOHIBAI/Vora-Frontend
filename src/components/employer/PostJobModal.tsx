import React, { useState, useRef } from 'react';
import { 
  CloseIcon, 
  UploadIcon, 
  FileIcon
} from '../common/Icons';
import Button from '../common/Button';
import Input from '../common/Input';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: (config: {
    isScheduled: boolean;
    goLiveDate: string;
    isPrefilled: boolean;
  }) => void;
}

const PostJobModal: React.FC<PostJobModalProps> = ({ isOpen, onClose, onContinue }) => {
  const [hiringMode, setHiringMode] = useState<'live' | 'vault' | null>(null);
  const [goLiveDate, setGoLiveDate] = useState('');
  const [entryMethod, setEntryMethod] = useState<'upload' | 'manual' | null>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'uploaded'>('idle');
  const [documentLink, setDocumentLink] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetModal = () => {
    setHiringMode(null);
    setGoLiveDate('');
    setEntryMethod(null);
    setUploadState('idle');
    setDocumentLink('');
    setUploadedFile(null);
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
        size: `${sizeInMB} MB`
      });
      setUploadState('uploaded');
    }
  };

  const handleUploadContainerClick = () => {
    if (uploadState === 'idle') {
      fileInputRef.current?.click();
    }
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
    setUploadState('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
    return entryMethod === 'upload' ? 'Continue with uploaded document' : 'Start filling in role details';
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={resetModal} />
      
      <div className="relative bg-white w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-[24px] shadow-2xl animate-in zoom-in-95 duration-500 scrollbar-hide">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
          <h2 className="text-[18px] font-medium text-gray-900 ">Post a Job</h2>
          <button onClick={resetModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 cursor-pointer">
            <CloseIcon size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* STEP 1: Hiring Mode */}
          <section className="space-y-4">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">When do you want to hire?</p>
            
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
                  <p className="text-[14px] font-medium text-gray-900">Post live now</p>
                  <p className="text-[12px] font-medium text-gray-400 mt-0.5">Role goes live immediately on submission. Matching fires the same day.</p>
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
                      <p className="text-[14px] font-medium text-gray-900">Schedule for later — Vault mode</p>
                      <span className="bg-blue-100 text-[#0047CC] text-[9px] font-medium px-2 py-0.5 rounded-full">RECOMMENDED</span>
                    </div>
                    <p className="text-[12px] font-medium text-gray-400 mt-0.5 leading-relaxed">
                      Lock in your rate today. VORA silently matches candidates while the role stays invisible until your go-live date.
                    </p>
                  </div>
                </button>

                {hiringMode === 'vault' && (
                  <div className="mt-4 pt-4 border-t border-blue-100 space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <Input 
                      label="Go-live date *"
                      type="date" 
                      value={goLiveDate}
                      onChange={(e) => setGoLiveDate(e.target.value)}
                      className="border-blue-200"
                    />
                    <div className="bg-white/60 p-4 rounded-xl space-y-2">
                      <p className="text-[11px] font-medium text-blue-900 leading-relaxed">
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
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">How would you like to fill in the role details?</p>
              
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
                      <p className="text-[14px] font-medium text-gray-900">Upload job document</p>
                      <p className="text-[12px] font-medium text-gray-400 mt-0.5">Upload your existing JD — VORA extracts and pre-fills all role details.</p>
                    </div>
                  </button>

                  {entryMethod === 'upload' && (
                    <div className="mt-4 pt-4 border-t border-blue-100 space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept=".pdf,.docx" 
                        className="hidden" 
                      />
                      <div 
                        onClick={handleUploadContainerClick}
                        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                          uploadState === 'uploaded' ? 'border-gray-100 bg-white/40' : 'border-blue-100 hover:border-blue-300 bg-white/60'
                        }`}
                      >
                        {uploadState === 'idle' ? (
                          <>
                            <UploadIcon size={24} className="text-[#0047CC]" />
                            <div className="text-center">
                              <p className="text-[13px] font-medium text-gray-800">Drop PDF or DOCX here</p>
                              <p className="text-[11px] font-medium text-gray-400 mt-1">or click to browse — Max 10MB</p>
                            </div>
                          </>
                        ) : (
                          <div className="w-full flex items-center gap-4 p-3 bg-white border border-green-100 rounded-xl shadow-sm">
                            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                              <FileIcon size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium text-gray-900 truncate">{uploadedFile?.name || 'document.pdf'}</p>
                              <p className="text-[11px] font-medium text-gray-400">{uploadedFile?.size || '0.0 MB'}</p>
                            </div>
                            <button className="text-gray-300 hover:text-red-500 p-2 cursor-pointer" onClick={handleClearFile}>
                              <CloseIcon size={14} strokeWidth={3} />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="h-px bg-blue-100 flex-1" />
                        <span className="text-[10px] font-medium text-blue-300 uppercase tracking-widest">OR</span>
                        <div className="h-px bg-blue-100 flex-1" />
                      </div>

                      <Input 
                        type="url" 
                        placeholder="Paste a link (https://...)" 
                        value={documentLink}
                        onChange={(e) => setDocumentLink(e.target.value)}
                        className="border-blue-100 placeholder:text-gray-300"
                      />
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
                    <p className="text-[14px] font-medium text-gray-900">Fill out manually</p>
                    <p className="text-[12px] font-medium text-gray-400 mt-0.5">Start from scratch and complete all steps yourself.</p>
                  </div>
                </button>
              </div>
            </section>
          )}

          {/* Action Button */}
          <div className="pt-4 sticky bottom-0 bg-white pb-2">
            <Button 
              disabled={!isReady()}
              onClick={() => {
                if (onContinue) {
                  onContinue({
                    isScheduled: hiringMode === 'vault',
                    goLiveDate: hiringMode === 'vault' ? goLiveDate : '',
                    isPrefilled: entryMethod === 'upload',
                  });
                } else {
                  resetModal();
                }
              }}
              className="shadow-xl"
            >
              {getContinueText()}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJobModal;
