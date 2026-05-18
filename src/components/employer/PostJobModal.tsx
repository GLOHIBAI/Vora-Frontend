import React, { useState, useRef } from 'react';
import { 
  CloseIcon, 
  UploadIcon, 
  FileIcon,
  ChevronLeftIcon
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
  const [modalStep, setModalStep] = useState<number>(1); // 1, 2, or 3
  const [entryMethod, setEntryMethod] = useState<'upload' | 'manual' | null>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'uploaded'>('idle');
  const [documentLink, setDocumentLink] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetModal = () => {
    setModalStep(1);
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

  const getHeaderTitle = () => {
    if (modalStep === 2) return 'Upload or Link a Job Description';
    if (modalStep === 3) return 'Job details extracted successfully';
    return 'Post a Job';
  };

  const isStepReady = () => {
    if (modalStep === 1) return entryMethod !== null;
    if (modalStep === 2) return uploadState === 'uploaded' || documentLink.trim().length > 0;
    return true;
  };

  const handleProceed = () => {
    if (modalStep === 1) {
      if (entryMethod === 'upload') {
        setModalStep(2);
      } else {
        if (onContinue) {
          onContinue({
            isScheduled: false,
            goLiveDate: '',
            isPrefilled: false,
          });
        }
        resetModal();
      }
    } else if (modalStep === 2) {
      setModalStep(3);
    } else if (modalStep === 3) {
      if (onContinue) {
        onContinue({
          isScheduled: false,
          goLiveDate: '',
          isPrefilled: true,
        });
      }
      resetModal();
    }
  };

  const handleBack = () => {
    if (modalStep === 3) {
      setModalStep(2);
    } else if (modalStep === 2) {
      setModalStep(1);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={resetModal} />
      
      <div className="relative bg-white w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-[24px] shadow-2xl animate-in zoom-in-95 duration-500 scrollbar-hide">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10 min-h-[73px]">
          <div className="flex items-center gap-3">
            {modalStep > 1 && (
              <button 
                onClick={handleBack}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500 cursor-pointer"
              >
                <ChevronLeftIcon size={20} strokeWidth={3} />
              </button>
            )}
            <h2 className="text-[16px] lg:text-[18px] font-medium text-gray-900">{getHeaderTitle()}</h2>
          </div>
          <button onClick={resetModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 cursor-pointer">
            <CloseIcon size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* STEP 1: Get Started */}
          {modalStep === 1 && (
            <div className="space-y-6">
              <p className="text-[14px] lg:text-[15px] font-medium text-gray-700">How would you like to get started?</p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => setEntryMethod('upload')}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-start gap-4 cursor-pointer ${
                    entryMethod === 'upload' ? 'border-[#0047CC] bg-blue-50/20' : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${entryMethod === 'upload' ? 'border-[#0047CC]' : 'border-gray-200'}`}>
                    {entryMethod === 'upload' && <div className="w-2.5 h-2.5 rounded-full bg-[#0047CC]" />}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-gray-900">Upload job document</p>
                    <p className="text-[12px] font-medium text-gray-400 mt-1 leading-relaxed">
                      Upload your existing job description, we'll prefill details for you to review.
                    </p>
                  </div>
                </button>

                <button 
                  onClick={() => setEntryMethod('manual')}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-start gap-4 cursor-pointer ${
                    entryMethod === 'manual' ? 'border-[#0047CC] bg-blue-50/20' : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${entryMethod === 'manual' ? 'border-[#0047CC]' : 'border-gray-200'}`}>
                    {entryMethod === 'manual' && <div className="w-2.5 h-2.5 rounded-full bg-[#0047CC]" />}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-gray-900">Fill out manually</p>
                    <p className="text-[12px] font-medium text-gray-400 mt-1 leading-relaxed">
                      Start from scratch and fill out all steps yourself.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Upload or Link */}
          {modalStep === 2 && (
            <div className="space-y-6">
              <p className="text-[13px] lg:text-[14px] font-medium text-gray-500 leading-relaxed">
                We'll extract job details from your existing description so you can review and publish faster.
              </p>

              <div className="space-y-4">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf,.docx" 
                  className="hidden" 
                />
                <div 
                  onClick={handleUploadContainerClick}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                    uploadState === 'uploaded' ? 'border-gray-100 bg-white/40' : 'border-blue-100 hover:border-blue-300 bg-white/60'
                  }`}
                >
                  {uploadState === 'idle' ? (
                    <>
                      <UploadIcon size={24} className="text-[#0047CC]" />
                      <div className="text-center">
                        <p className="text-[13px] font-medium text-gray-800">Choose file to upload</p>
                        <p className="text-[11px] font-medium text-gray-400 mt-1">Supported formats: pdf, docx</p>
                      </div>
                    </>
                  ) : (
                    <div className="w-full flex items-center gap-4 p-3 bg-white border border-[#E6E6E6] rounded-xl shadow-sm">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#0047CC]">
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
                  <div className="h-px bg-gray-100 flex-1" />
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">OR</span>
                  <div className="h-px bg-gray-100 flex-1" />
                </div>

                <Input 
                  label="Import from URL"
                  type="url" 
                  placeholder="Input document link" 
                  value={documentLink}
                  onChange={(e) => setDocumentLink(e.target.value)}
                  className="placeholder:text-gray-300"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Extraction Success */}
          {modalStep === 3 && (
            <div className="space-y-5">
              <p className="text-[13px] lg:text-[14px] font-medium text-gray-500 leading-relaxed">
                We've filled in most sections for you. You can review and edit them before publishing.
              </p>

              <div className="bg-[#F7F7F7] border border-gray-100 rounded-2xl p-5 space-y-4">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <p className="text-[10px] lg:text-[11px] font-medium text-gray-400 uppercase tracking-wider">Role title</p>
                    <p className="text-[13px] font-medium text-gray-900 mt-0.5 truncate">Global Health Research Intern</p>
                  </div>
                  <div>
                    <p className="text-[10px] lg:text-[11px] font-medium text-gray-400 uppercase tracking-wider">Role type</p>
                    <p className="text-[13px] font-medium text-gray-900 mt-0.5 truncate">Internship</p>
                  </div>
                  <div>
                    <p className="text-[10px] lg:text-[11px] font-medium text-gray-400 uppercase tracking-wider">Employment level</p>
                    <p className="text-[13px] font-medium text-gray-900 mt-0.5 truncate">--</p>
                  </div>
                  <div>
                    <p className="text-[10px] lg:text-[11px] font-medium text-gray-400 uppercase tracking-wider">Available positions</p>
                    <p className="text-[13px] font-medium text-gray-900 mt-0.5 truncate">3 positions</p>
                  </div>
                  <div>
                    <p className="text-[10px] lg:text-[11px] font-medium text-gray-400 uppercase tracking-wider">Time commitment</p>
                    <p className="text-[13px] font-medium text-gray-900 mt-0.5 truncate">20hrs/week</p>
                  </div>
                  <div>
                    <p className="text-[10px] lg:text-[11px] font-medium text-gray-400 uppercase tracking-wider">Time preference</p>
                    <p className="text-[13px] font-medium text-gray-900 mt-0.5 truncate">GMT + 1</p>
                  </div>
                  <div>
                    <p className="text-[10px] lg:text-[11px] font-medium text-gray-400 uppercase tracking-wider">Work format</p>
                    <p className="text-[13px] font-medium text-gray-900 mt-0.5 truncate">Onsite</p>
                  </div>
                  <div>
                    <p className="text-[10px] lg:text-[11px] font-medium text-gray-400 uppercase tracking-wider">Work location</p>
                    <p className="text-[13px] font-medium text-gray-900 mt-0.5 truncate">Lagos, Nigeria</p>
                  </div>
                  <div>
                    <p className="text-[10px] lg:text-[11px] font-medium text-gray-400 uppercase tracking-wider">Start date</p>
                    <p className="text-[13px] font-medium text-gray-900 mt-0.5 truncate">October 21st, 2025</p>
                  </div>
                  <div>
                    <p className="text-[10px] lg:text-[11px] font-medium text-gray-400 uppercase tracking-wider">End date</p>
                    <p className="text-[13px] font-medium text-gray-900 mt-0.5 truncate">January 21st 2026</p>
                  </div>
                </div>
                <div className="border-t border-gray-200/60 pt-3">
                  <p className="text-[10px] lg:text-[11px] font-medium text-gray-400 uppercase tracking-wider">Role summary</p>
                  <p className="text-[13px] font-medium text-gray-700 mt-1 leading-relaxed">
                    Lorem ipsum dolor sit amet consectetur. Vierra lectus rutrum luesnh... <span className="text-[#0047CC] font-semibold cursor-pointer hover:underline">see more</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2 sticky bottom-0 bg-white pb-2">
            <Button 
              disabled={!isStepReady()}
              onClick={handleProceed}
              className="shadow-xl"
            >
              {modalStep === 1 ? 'Proceed' : modalStep === 2 ? 'Extract job details' : 'Continue to form'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJobModal;
