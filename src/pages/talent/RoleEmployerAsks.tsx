import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getRoleLandingForSlug, mapApiResponseToRoleData } from '../../utils/roleLanding';
import type { PublicRoleLandingData } from '../../types/roleLanding';
import { 
  useGetPublicRoleQuery, 
  useGetPreAssessmentReadinessQuery,
  useSubmitPreAssessmentSubmissionMutation,
  useUpdatePreAssessmentTextResponseMutation,
  useUpdatePreAssessmentReferencesMutation,
  useUpdatePreAssessmentLinksMutation,
  useUpdatePreAssessmentConsentsMutation,
  useCompletePreAssessmentMutation
} from '../../services/queries/talent';
import {
  ChevronDownIcon
} from '../../components/common/Icons';
import VoraLogo from '../../components/common/VoraLogo';
import ScrollArea from '../../components/common/ScrollArea';
import Select from '../../components/common/Select';
import { loadRoleApplySlug } from '../../utils/roleSignup';
import FullPageSpinner from '../../components/common/FullPageSpinner';
import Tag from '../../components/common/Tag';

// Icons used in the page
const Trash2Icon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const LinkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

const DocumentCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const StageRail: React.FC = () => (
  <div className="bg-white border-b border-[#E6E6E6] px-[32px] py-[10px] flex items-center justify-center gap-[10px] overflow-x-auto whitespace-nowrap">
    <div className="flex items-center gap-[6px] shrink-0">
      <div className="w-[20px] h-[20px] rounded-full bg-[#0047CC] flex items-center justify-center text-[10px] font-[800] text-white" style={{ boxShadow: '0 0 0 3px rgba(0,71,204,.12)' }}>1</div>
      <div className="text-[11px] font-[700] text-[#0047CC]">Getting to know you</div>
    </div>
    <div className="w-[24px] h-[2px] bg-[#E6E6E6] rounded-[2px]" />
    
    <div className="flex items-center gap-[6px] shrink-0">
      <div className="w-[20px] h-[20px] rounded-full bg-[#E6E6E6] flex items-center justify-center text-[10px] font-[800] text-white">2</div>
      <div className="text-[11px] font-[700] text-[#ADADAD]">Professional dimension</div>
    </div>
    <div className="w-[24px] h-[2px] bg-[#E6E6E6] rounded-[2px]" />

    <div className="flex items-center gap-[6px] shrink-0">
      <div className="w-[20px] h-[20px] rounded-full bg-[#E6E6E6] flex items-center justify-center text-[10px] font-[800] text-white">3</div>
      <div className="text-[11px] font-[700] text-[#ADADAD]">How you show up</div>
    </div>
    <div className="w-[24px] h-[2px] bg-[#E6E6E6] rounded-[2px]" />

    <div className="flex items-center gap-[6px] shrink-0">
      <div className="w-[20px] h-[20px] rounded-full bg-[#E6E6E6] flex items-center justify-center text-[10px] font-[800] text-white">4</div>
      <div className="text-[11px] font-[700] text-[#ADADAD]">Final decision</div>
    </div>
  </div>
);

const RoleEmployerAsks: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const params = useParams<{ roleSlug: string }>();
  const roleSlug = params.roleSlug || '';

  const { data: response, isLoading: isRoleLoading } = useGetPublicRoleQuery(roleSlug || '');
  const { data: readinessResponse, isLoading: isReadinessLoading, refetch } = useGetPreAssessmentReadinessQuery(roleSlug || '');

  const submitSubmission = useSubmitPreAssessmentSubmissionMutation();
  const updateText = useUpdatePreAssessmentTextResponseMutation();
  const updateReferences = useUpdatePreAssessmentReferencesMutation();
  const updateLinks = useUpdatePreAssessmentLinksMutation();
  const updateConsents = useUpdatePreAssessmentConsentsMutation();
  const completePreAssessment = useCompletePreAssessmentMutation();

  const [hasInitialized, setHasInitialized] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [uploadingFile, setUploadingFile] = useState<{ code: string; name: string } | null>(null);

  const [consents, setConsents] = useState({
    truthful: false,
    usage: false,
    references: false
  });

  const [ref1, setRef1] = useState({
    fullName: '',
    roleAndOrganisation: '',
    email: '',
    phone: '',
    relationship: 'manager'
  });

  const [ref2, setRef2] = useState({
    fullName: '',
    roleAndOrganisation: '',
    email: '',
    phone: '',
    relationship: 'peer'
  });

  const readiness = readinessResponse?.data || readinessResponse;

  // ---------------------------------------------------------------------------
  // Derive which optional sections the API is asking for
  // ---------------------------------------------------------------------------
  const preAssessmentItems: any[] = useMemo(
    () => (Array.isArray(readiness?.items) ? readiness.items : []),
    [readiness],
  );

  const textItem = useMemo(
    () => preAssessmentItems.find((i: any) => i.kind === 'text') ?? null,
    [preAssessmentItems],
  );

  /** Show the written-response box when the API item list includes a text entry,
   *  or when the backend sends an explicit requiresTextResponse flag. */
  const showTextResponse: boolean = useMemo(
    () =>
      !!textItem ||
      readiness?.requiresTextResponse === true ||
      preAssessmentItems.some((i: any) => i.kind === 'text'),
    [textItem, readiness, preAssessmentItems],
  );

  /** Show the references block when the API says so, or when the readiness
   *  payload already contains saved references from a previous session. */
  const showReferences: boolean = useMemo(
    () =>
      readiness?.requiresReferences === true ||
      preAssessmentItems.some((i: any) => i.kind === 'references') ||
      (Array.isArray(readiness?.references) && readiness.references.length > 0),
    [readiness, preAssessmentItems],
  );

  /** Show the optional links block when the API says so.  Falls back to
   *  showing it when saved portfolio links already exist from a prior visit. */
  const showLinks: boolean = useMemo(
    () =>
      readiness?.requiresLinks === true ||
      readiness?.allowPortfolioLinks === true ||
      preAssessmentItems.some((i: any) => i.kind === 'urls') ||
      (Array.isArray(readiness?.portfolioLinks) && readiness.portfolioLinks.length > 0) ||
      portfolioUrls.length > 0,
    [readiness, preAssessmentItems, portfolioUrls],
  );

  // Dynamic section numbering — starts after the required-document uploads.
  const docCount = Array.isArray(readiness?.requiredDocuments) ? readiness.requiredDocuments.length : 0;
  const textSectionIdx   = docCount + 1;
  const refSectionIdx    = docCount + (showTextResponse ? 1 : 0) + 1;
  const linksSectionIdx  = docCount + (showTextResponse ? 1 : 0) + (showReferences ? 1 : 0) + 1;

  const hasRequiredFiles = useMemo(() => {
    if (readiness) {
      if (readiness.requiresSubmissions === true) return true;
      if (readiness.requiresSubmissions === false) return false;
      if (Array.isArray(readiness.requiredDocumentTypes) && readiness.requiredDocumentTypes.length > 0) return true;
      if (Array.isArray(readiness.preAssessmentDocumentTypes) && readiness.preAssessmentDocumentTypes.length > 0) return true;
      if (readiness.requiredDocumentsCount > 0) return true;
      if (Array.isArray(readiness.requiredDocuments) && readiness.requiredDocuments.length > 0) return true;
      if (showTextResponse || showReferences) return true;
    }

    const roleData = response?.data || response;
    if (roleData) {
      if (Array.isArray(roleData.preAssessmentDocumentTypes) && roleData.preAssessmentDocumentTypes.length > 0) return true;
      if (Array.isArray(roleData.preAssessmentRequirements) && roleData.preAssessmentRequirements.length > 0) return true;
    }

    if (!roleData && !readiness) {
      return true; // Keep mockup visible for mock roles / local static viewing
    }
    return false;
  }, [readinessResponse, response, showTextResponse, showReferences]);

  // Sync state from API on initial load
  useEffect(() => {
    if (readiness && !hasInitialized) {
      setHasInitialized(true);

      // Text response
      if (readiness.textResponse) {
        setTextValue(readiness.textResponse);
      } else if (Array.isArray(readiness.items)) {
        const textItem = readiness.items.find((item: any) => item.kind === 'text');
        if (textItem?.value) setTextValue(textItem.value);
      }

      // References
      if (Array.isArray(readiness.references) && readiness.references.length >= 2) {
        setRef1({
          fullName: readiness.references[0].fullName || '',
          roleAndOrganisation: readiness.references[0].roleOrganisation || readiness.references[0].roleAndOrganisation || '',
          email: readiness.references[0].email || '',
          phone: readiness.references[0].phone || '',
          relationship: readiness.references[0].type === 'line_manager' ? 'manager' : (readiness.references[0].relationship || 'manager')
        });
        setRef2({
          fullName: readiness.references[1].fullName || '',
          roleAndOrganisation: readiness.references[1].roleOrganisation || readiness.references[1].roleAndOrganisation || '',
          email: readiness.references[1].email || '',
          phone: readiness.references[1].phone || '',
          relationship: readiness.references[1].type === 'peer_or_community' ? 'peer' : (readiness.references[1].relationship || 'peer')
        });
      }

      // Portfolio urls
      if (Array.isArray(readiness.portfolioLinks)) {
        setPortfolioUrls(readiness.portfolioLinks);
      } else if (Array.isArray(readiness.items)) {
        const urlsItem = readiness.items.find((item: any) => item.kind === 'urls');
        if (Array.isArray(urlsItem?.value)) {
          setPortfolioUrls(urlsItem.value);
        }
      }

      // Consents
      if (readiness.consents) {
        setConsents({
          truthful: readiness.consents.truthfulWork || false,
          usage: readiness.consents.dataUseConsent || false,
          references: readiness.consents.referencesStage4 || false
        });
      }
    }
  }, [readiness, hasInitialized]);

  // Skip page redirect guard
  useEffect(() => {
    if (!isRoleLoading && !isReadinessLoading) {
      if (!hasRequiredFiles) {
        navigate(`/onboarding/talent/${roleSlug}/assessment/journey`, { replace: true });
      }
    }
  }, [isRoleLoading, isReadinessLoading, hasRequiredFiles, navigate, roleSlug]);

  const appliedRole: PublicRoleLandingData | null = useMemo(() => {
    if (!roleSlug) return null;
    const apiData = response?.data || response;
    if (!apiData || Object.keys(apiData).length === 0) {
      return getRoleLandingForSlug(roleSlug);
    }
    return mapApiResponseToRoleData(roleSlug, apiData);
  }, [response, roleSlug]);

  if (isRoleLoading || isReadinessLoading) {
    return <FullPageSpinner />;
  }

  const companyName = appliedRole?.companyName || 'Reach Africa';
  const roleTitle = appliedRole?.roleTitle || 'Senior Health Programme Officer';
  const roleLocation = appliedRole?.companyLocation || 'Lagos';
  const companyInitials = appliedRole?.companyInitials || 'RA';

  const handleSaveAndExit = () => {
    navigate('/dashboard');
  };

  const handleSaveReferences = async () => {
    if (!ref1.fullName || !ref1.roleAndOrganisation || !ref1.email ||
        !ref2.fullName || !ref2.roleAndOrganisation || !ref2.email) {
      return;
    }
    try {
      await updateReferences.mutateAsync({
        references: [ref1, ref2],
        roleLink: roleSlug
      });
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save references draft");
    }
  };

  const handleConsentToggle = async (key: 'truthful' | 'usage' | 'references') => {
    const nextConsents = { ...consents, [key]: !consents[key] };
    setConsents(nextConsents);
    try {
      await updateConsents.mutateAsync({
        truthfulWork: nextConsents.truthful,
        dataUseConsent: nextConsents.usage,
        referencesStage4: nextConsents.references,
        roleLink: roleSlug
      });
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update consents");
    }
  };

  const handleSubmit = async () => {
    try {
      await completePreAssessment.mutateAsync({ roleLink: roleSlug });
      toast.success("Pre-assessment finalized successfully!");
      navigate(`/onboarding/talent/${roleSlug}/assessment/journey`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to finalize pre-assessment");
    }
  };

  const progressPercent = readiness?.progress?.percent ?? 0;
  const completedRequired = readiness?.progress?.completedRequired ?? 0;
  const totalRequired = readiness?.progress?.totalRequired ?? 0;
  const canFinalize = readiness?.checks?.canFinalizePreAssessment === true;

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans">
      <header className="sticky top-0 z-[50] bg-white/95 backdrop-blur-[10px] px-[32px] py-[12px] flex items-center justify-between">
        <span className="inline-flex items-center gap-[1px] text-[#0047CC]">
          <VoraLogo size="sm" to="/dashboard" />
        </span>
        <div className="text-[12.5px] text-[#808080] font-[600]">
          Before Stage 1 opens · {companyName}&apos;s additional asks
        </div>
        <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
          <div className="w-[16px] h-[16px] rounded-full border border-[#0047CC] bg-white flex items-center justify-center shrink-0">
            <DocumentCheckIcon className="w-[9px] h-[9px] text-[#0047CC]" />
          </div>
          <span className="hidden sm:inline">Draft saved</span>
          <span className="sm:hidden">Saved</span>
        </div>
      </header>

      <StageRail />

      <section className="relative px-[32px] pt-[48px] pb-[48px] bg-gradient-to-br from-[#182348] to-[#0047CC] overflow-hidden text-white">
        <div className="absolute top-[-60px] right-[20%] w-[220px] h-[220px] rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-[-80px] right-[-40px] w-[280px] h-[280px] rounded-full bg-[#387DFF]/20 pointer-events-none" />
        <div className="absolute top-[40%] left-[-100px] w-[260px] h-[260px] rounded-full bg-white/5 pointer-events-none" />

        <div className="max-w-[820px] mx-auto relative z-10">
          <div className="flex gap-[20px] items-start mb-[24px]">
            <div className="w-[64px] h-[64px] rounded-[16px] bg-white/10 border border-white/20 flex items-center justify-center text-white font-[900] text-[20px] shrink-0 tracking-[0.5px] backdrop-blur-sm shadow-sm">
              {companyInitials}
            </div>
            <div className="flex-1 pt-[2px]">
              <div className="text-[11px] font-[800] tracking-[0.8px] uppercase text-[#EBF6FF] mb-[6px]">
                Additional materials requested by
              </div>
              <div className="text-[26px] font-[900] text-white tracking-[-0.4px] leading-[1.2] mb-[6px]">
                {companyName}
              </div>
              <div className="text-[14px] text-white/70 font-[500] leading-[1.45]">
                {roleTitle} · {roleLocation}
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-[8px] bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-[14px] py-[6px] mb-[24px]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[14px] h-[14px] text-white">
              <path d="M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
            </svg>
            <span className="text-[11.5px] font-[800] tracking-[0.3px] text-white">Stage 1 unlocks once these are submitted</span>
          </div>

          <h1 className="text-[22px] font-[800] text-white tracking-[-0.3px] leading-[1.3] mb-[10px]">
            A few extras {companyName} has asked you for
          </h1>
          <p className="text-[14.5px] text-white/80 leading-[1.65] max-w-[680px]">
            Your CV, experience profile and verified credentials are already on file. The items below are specific to this role and were chosen by the {companyName} hiring team. Each one shapes how your interviews are framed and how your profile reads to them.
          </p>
        </div>
      </section>

      <main className="max-w-[820px] mx-auto px-[28px] pt-[32px] pb-[110px]">
        {/* Already on file */}
        <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[14px] p-[18px_22px] mb-[28px] flex gap-[14px] items-start">
          <div className="w-[38px] h-[38px] rounded-[10px] bg-[#EBF6FF] border border-[#387DFF]/30 flex items-center justify-center text-[#0047CC] shrink-0">
            <DocumentCheckIcon className="w-[20px] h-[20px]" />
          </div>
          <div className="flex-1">
            <div className="text-[13.5px] font-[800] text-[#1A1A1A] mb-[4px] flex items-center gap-[8px] flex-wrap">
              Already on file · no need to re-upload
            </div>
            <div className="text-[12.5px] text-[#4A4A4A] leading-[1.55]">
              Your candidate profile is already attached to this application. <Link to="/onboarding/talent/match" className="text-[#0047CC] font-[700] hover:underline">Review or update</Link>
            </div>
            <div className="flex gap-[6px] flex-wrap mt-[10px]">
              {['CV (v3, May 2026)', 'Years of practice', 'Specialisations', 'Languages', 'Verified certifications', 'EMR experience'].map(item => (
                <span key={item} className="text-[11px] font-[700] bg-white border border-[#0047CC] text-[#0047CC] px-[12px] py-[4px] rounded-full inline-flex items-center">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Strip */}
        <div className="flex items-center gap-[10px] mb-[22px] p-[14px_18px] bg-white border-[1.5px] border-[#E6E6E6] rounded-[12px]">
          <div className="text-[11px] font-[800] tracking-[0.6px] uppercase text-[#808080] shrink-0">
            {companyName}&apos;s checklist
          </div>
          <div className="flex-1 h-[8px] bg-[#F7F7F7] rounded-full overflow-hidden relative">
            <div className="h-full bg-gradient-to-r from-[#0047CC] to-[#387DFF] rounded-full transition-all duration-400" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="text-[12px] font-[800] text-[#1A1A1A] shrink-0 tabular-nums">
            {completedRequired} of {totalRequired} complete
          </div>
        </div>

        {/* Render required document checklist items dynamically */}
        {Array.isArray(readiness?.requiredDocuments) && readiness.requiredDocuments.map((doc: any, idx: number) => {
          return (
            <div key={doc.code} className="bg-gradient-to-b from-[#F8FBFF] to-white border-[1.5px] border-[#387DFF]/50 rounded-[16px] p-[24px_26px] mb-[16px] relative overflow-visible z-50">
              <div className="flex items-start justify-between gap-[14px] mb-[14px]">
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-[7px] mb-[8px]">
                    <div className="w-[26px] h-[26px] rounded-full bg-[#0047CC] text-white font-[900] text-[12px] flex items-center justify-center shrink-0">{idx + 1}</div>
                    <div className="text-[10.5px] font-[800] tracking-[0.7px] uppercase text-[#0047CC]">{companyName} is asking for</div>
                  </div>
                  <div className="text-[17px] font-[800] text-[#1A1A1A] tracking-[-0.2px] leading-[1.3] mb-[5px]">
                    {doc.label}
                  </div>
                  <div className="text-[13px] text-[#808080] leading-[1.55]">
                    {doc.category === 'written_research' ? 'An abstract, paper, conference poster, or research note you\'ve authored or co-authored. One file.' : 'Please upload the requested material.'}
                  </div>
                </div>
                <Tag 
                  label={doc.submitted ? "SUBMITTED" : "REQUIRED"} 
                  variant="blue" 
                  className="uppercase shrink-0" 
                />
              </div>
              <div className="text-[12px] text-[#4A4A4A] leading-[1.55] bg-[#EBF6FF] p-[9px_12px] rounded-[8px]">
                <strong className="font-[800] text-[#182348]">Why we ask:</strong> to review your work and frame specific questions based on the evidence.
              </div>
              
              <div className="mt-[14px]">
                {doc.submitted || uploadingFile?.code === doc.code ? (
                  <div className="border border-[#0047CC] bg-white rounded-[12px] p-[16px_18px] flex items-center gap-[14px]">
                    <div className="w-[38px] h-[38px] rounded-[10px] bg-[#EBF6FF] border border-[#387DFF]/50 text-[#0047CC] flex items-center justify-center shrink-0">
                      {uploadingFile?.code === doc.code ? (
                        <svg className="animate-spin h-[18px] w-[18px] text-[#0047CC]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <DocumentCheckIcon className="w-[18px] h-[18px]" />
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-[13.5px] text-[#1A1A1A] font-[700] break-all leading-[1.4]">
                        {uploadingFile?.code === doc.code ? uploadingFile.name : (doc.originalName || 'uploaded_document.pdf')}
                      </div>
                      <div className="text-[11.5px] text-[#0047CC] font-[600] mt-[3px]">
                        {uploadingFile?.code === doc.code ? (
                          <span className="text-[#387DFF] font-medium animate-pulse">Uploading…</span>
                        ) : doc.uploadedAt ? (
                          `Uploaded on ${new Date(doc.uploadedAt).toLocaleDateString()}`
                        ) : (
                          'Uploaded successfully'
                        )}
                      </div>
                    </div>
                    <div className="relative shrink-0">
                      <label className={`text-[12.5px] font-[700] border rounded-full px-4 py-1.5 transition-colors relative shrink-0 inline-block text-center min-w-[90px] select-none ${
                        uploadingFile?.code === doc.code 
                          ? 'border-[#ADADAD] text-[#ADADAD] bg-white cursor-not-allowed'
                          : 'text-[#0047CC] border-[#0047CC] hover:bg-[#EBF6FF] cursor-pointer'
                      }`}>
                        {uploadingFile?.code === doc.code ? 'Uploading…' : 'Change file'}
                        {uploadingFile?.code !== doc.code && (
                          <input 
                            type="file" 
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setUploadingFile({ code: doc.code, name: file.name });
                              try {
                                await submitSubmission.mutateAsync({
                                  file,
                                  documentType: doc.code,
                                  roleLink: roleSlug
                                });
                                toast.success("Document updated successfully!");
                                refetch();
                              } catch (err: any) {
                                toast.error(err?.message || "Failed to update document");
                              } finally {
                                setUploadingFile(null);
                              }
                            }}
                          />
                        )}
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#E6E6E6] rounded-[12px] p-[24px] bg-[#F7F7F7] hover:border-[#0047CC] transition-colors relative cursor-pointer group">
                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingFile({ code: doc.code, name: file.name });
                        try {
                          await submitSubmission.mutateAsync({
                            file,
                            documentType: doc.code,
                            roleLink: roleSlug
                          });
                          toast.success("Document uploaded successfully!");
                          refetch();
                        } catch (err: any) {
                          toast.error(err?.message || "Failed to upload document");
                        } finally {
                          setUploadingFile(null);
                        }
                      }}
                    />
                    <svg className="w-[24px] h-[24px] text-[#ADADAD] group-hover:text-[#0047CC] transition-colors mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="text-[13px] font-[700] text-[#4A4A4A] group-hover:text-[#0047CC] transition-colors">Drag & drop or browse</span>
                    <span className="text-[11px] text-[#808080] mt-1">PDF, Word, or Image up to 10MB</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Written Response — rendered only when the API requests it */}
        {showTextResponse && (
          <div className="bg-gradient-to-b from-[#F8FBFF] to-white border-[1.5px] border-[#387DFF]/50 rounded-[16px] p-[24px_26px] mb-[16px] relative overflow-visible z-30">
            <div className="flex items-start justify-between gap-[14px] mb-[14px]">
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-[7px] mb-[8px]">
                  <div className="w-[26px] h-[26px] rounded-full bg-[#0047CC] text-white font-[900] text-[12px] flex items-center justify-center shrink-0">{textSectionIdx}</div>
                  <div className="text-[10.5px] font-[800] tracking-[0.7px] uppercase text-[#0047CC]">{companyName} is asking for</div>
                </div>
                <div className="text-[17px] font-[800] text-[#1A1A1A] tracking-[-0.2px] leading-[1.3] mb-[5px]">
                  {textItem?.label ?? 'A short written response · in your own words'}
                </div>
                <div className="text-[13px] text-[#808080] leading-[1.55]">
                  {textItem?.prompt
                    ? <>&quot;<em>{textItem.prompt}</em>&quot;</>  
                    : readiness?.textPrompt
                    ? <>&quot;<em>{readiness.textPrompt}</em>&quot;</>
                    : null}
                  {textItem?.minWords || textItem?.maxWords
                    ? ` Around ${textItem.minWords ?? ''}–${textItem.maxWords ?? ''} words.`
                    : null}
                </div>
              </div>
              <Tag
                label={textValue.trim().split(/\s+/).filter(Boolean).length >= (textItem?.minWords ?? 150) ? 'FILLED' : 'REQUIRED'}
                variant="blue"
                className="uppercase shrink-0"
              />
            </div>
            {(textItem?.whyWeAsk || readiness?.textWhyWeAsk) && (
              <div className="text-[12px] text-[#4A4A4A] leading-[1.55] bg-[#EBF6FF] p-[9px_12px] rounded-[8px]">
                <strong className="font-[800] text-[#182348]">Why we ask:</strong>{' '}
                {textItem?.whyWeAsk ?? readiness?.textWhyWeAsk}
              </div>
            )}
            <div className="mt-[14px]">
              <div className="flex flex-col gap-[6px]">
                <textarea
                  className="font-sans text-[14px] text-[#4A4A4A] leading-[1.6] border-[1.5px] border-[#E6E6E6] rounded-[10px] p-[11px_13px] bg-[#F7F7F7] focus:bg-white focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20 outline-none w-full h-[140px] resize-y"
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder={`Type your response here...${textItem?.minWords ? ` (around ${textItem.minWords} words)` : ''}`}
                  onBlur={async () => {
                    try {
                      await updateText.mutateAsync({ text: textValue, roleLink: roleSlug });
                      toast.success('Written response draft saved');
                      refetch();
                    } catch (err: any) {
                      toast.error(err?.message || 'Failed to save response');
                    }
                  }}
                />
                <div className="flex justify-between items-center mt-[-3px]">
                  <span className="text-[11px] text-[#808080]">Draft auto-saves when clicking away</span>
                  <span className="text-[11px] text-[#0047CC] font-[600] tabular-nums">
                    {textValue.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* References — rendered only when the API requests them */}
        {showReferences && (
          <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[16px] p-[24px_26px] mb-[16px] relative overflow-visible transition-all duration-250 z-20">
            <div className="flex items-start justify-between gap-[14px] mb-[14px]">
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-[7px] mb-[8px]">
                  <div className="w-[26px] h-[26px] rounded-full bg-[#0047CC] text-white font-[900] text-[12px] flex items-center justify-center shrink-0">{refSectionIdx}</div>
                  <div className="text-[10.5px] font-[800] tracking-[0.7px] uppercase text-[#0047CC]">{companyName} is asking for</div>
                </div>
                <div className="text-[17px] font-[800] text-[#1A1A1A] tracking-[-0.2px] leading-[1.3] mb-[5px]">
                  Two professional references
                </div>
                <div className="text-[13px] text-[#808080] leading-[1.55]">
                  A line manager and one peer or community stakeholder who can speak to your work. Contact details only at this stage. They won&apos;t be contacted unless you reach Stage 4.
                </div>
              </div>
              <Tag
                label={ref1.fullName && ref2.fullName ? 'FILLED' : 'REQUIRED'}
                variant="blue"
                className="uppercase shrink-0"
              />
            </div>

            <div className="text-[12px] text-[#4A4A4A] leading-[1.55] bg-[#EBF6FF] p-[9px_12px] rounded-[8px] mb-[14px]">
              <strong className="font-[800] text-[#182348]">Why we ask:</strong> the people you&apos;ve worked alongside often see your work most clearly.
            </div>

            <div className="mt-[14px] space-y-4">
              <div className="bg-[#F7F7F7] rounded-[12px] p-[16px_18px] mb-[10px]">
                <div className="flex items-center justify-between mb-[10px]">
                  <div className="text-[11px] font-[800] tracking-[0.5px] uppercase text-[#1A1A1A]">Reference 1 · Line manager</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
                  <div className="flex flex-col gap-[6px]">
                    <label className="text-[12.5px] font-[700] text-[#4A4A4A]">Full name <span className="text-[#DC2626]">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Dr Adaobi Mensah"
                      className="font-sans text-[14px] border-[1.5px] border-[#E6E6E6] rounded-[10px] p-[11px_13px] bg-white text-[#1A1A1A] w-full focus:outline-none focus:border-[#0047CC] focus:ring-[3px] focus:ring-[#0047CC]/10 transition-all"
                      value={ref1.fullName}
                      onChange={(e) => setRef1(prev => ({ ...prev, fullName: e.target.value }))}
                      onBlur={handleSaveReferences}
                    />
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <label className="text-[12.5px] font-[700] text-[#4A4A4A]">Role and organisation <span className="text-[#DC2626]">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Country Director, Health Outreach Africa"
                      className="font-sans text-[14px] border-[1.5px] border-[#E6E6E6] rounded-[10px] p-[11px_13px] bg-white text-[#1A1A1A] w-full focus:outline-none focus:border-[#0047CC] focus:ring-[3px] focus:ring-[#0047CC]/10 transition-all"
                      value={ref1.roleAndOrganisation}
                      onChange={(e) => setRef1(prev => ({ ...prev, roleAndOrganisation: e.target.value }))}
                      onBlur={handleSaveReferences}
                    />
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <label className="text-[12.5px] font-[700] text-[#4A4A4A]">Work email <span className="text-[#DC2626]">*</span></label>
                    <input
                      type="email"
                      placeholder="name@organisation.org"
                      className="font-sans text-[14px] border-[1.5px] border-[#E6E6E6] rounded-[10px] p-[11px_13px] bg-white text-[#1A1A1A] w-full focus:outline-none focus:border-[#0047CC] focus:ring-[3px] focus:ring-[#0047CC]/10 transition-all"
                      value={ref1.email}
                      onChange={(e) => setRef1(prev => ({ ...prev, email: e.target.value }))}
                      onBlur={handleSaveReferences}
                    />
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <label className="text-[12.5px] font-[700] text-[#4A4A4A]">Phone (optional)</label>
                    <input
                      type="tel"
                      placeholder="+234..."
                      className="font-sans text-[14px] border-[1.5px] border-[#E6E6E6] rounded-[10px] p-[11px_13px] bg-white text-[#1A1A1A] w-full focus:outline-none focus:border-[#0047CC] focus:ring-[3px] focus:ring-[#0047CC]/10 transition-all"
                      value={ref1.phone}
                      onChange={(e) => setRef1(prev => ({ ...prev, phone: e.target.value }))}
                      onBlur={handleSaveReferences}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#F7F7F7] rounded-[12px] p-[16px_18px]">
                <div className="flex items-center justify-between mb-[10px]">
                  <div className="text-[11px] font-[800] tracking-[0.5px] uppercase text-[#1A1A1A]">Reference 2 · Peer or community stakeholder</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
                  <div className="flex flex-col gap-[6px]">
                    <label className="text-[12.5px] font-[700] text-[#4A4A4A]">Full name <span className="text-[#DC2626]">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Mama Folake Adeyemi"
                      className="font-sans text-[14px] border-[1.5px] border-[#E6E6E6] rounded-[10px] p-[11px_13px] bg-white text-[#1A1A1A] w-full focus:outline-none focus:border-[#0047CC] focus:ring-[3px] focus:ring-[#0047CC]/10 transition-all"
                      value={ref2.fullName}
                      onChange={(e) => setRef2(prev => ({ ...prev, fullName: e.target.value }))}
                      onBlur={handleSaveReferences}
                    />
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <label className="text-[12.5px] font-[700] text-[#4A4A4A]">Role and organisation <span className="text-[#DC2626]">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. CHW Lead, Ifako Ward"
                      className="font-sans text-[14px] border-[1.5px] border-[#E6E6E6] rounded-[10px] p-[11px_13px] bg-white text-[#1A1A1A] w-full focus:outline-none focus:border-[#0047CC] focus:ring-[3px] focus:ring-[#0047CC]/10 transition-all"
                      value={ref2.roleAndOrganisation}
                      onChange={(e) => setRef2(prev => ({ ...prev, roleAndOrganisation: e.target.value }))}
                      onBlur={handleSaveReferences}
                    />
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <label className="text-[12.5px] font-[700] text-[#4A4A4A]">Email or contact <span className="text-[#DC2626]">*</span></label>
                    <input
                      type="text"
                      placeholder="email or phone is fine"
                      className="font-sans text-[14px] border-[1.5px] border-[#E6E6E6] rounded-[10px] p-[11px_13px] bg-white text-[#1A1A1A] w-full focus:outline-none focus:border-[#0047CC] focus:ring-[3px] focus:ring-[#0047CC]/10 transition-all"
                      value={ref2.email}
                      onChange={(e) => setRef2(prev => ({ ...prev, email: e.target.value }))}
                      onBlur={handleSaveReferences}
                    />
                  </div>
                  <div className="flex flex-col gap-[6px] z-10">
                    <label className="text-[12.5px] font-[700] text-[#4A4A4A]">Relationship</label>
                    <Select
                      hideLabel
                      options={[
                        { label: 'Peer / colleague', value: 'peer' },
                        { label: 'Community stakeholder', value: 'stakeholder' },
                        { label: 'External partner', value: 'partner' },
                        { label: 'Mentor', value: 'mentor' },
                      ]}
                      value={ref2.relationship}
                      onChange={(e: any) => {
                        const val = e.target.value;
                        setRef2(prev => {
                          const updated = { ...prev, relationship: val };
                          updateReferences.mutate({ references: [ref1, updated], roleLink: roleSlug });
                          return updated;
                        });
                      }}
                      className="!p-[11px_13px] !rounded-[10px] !border-[1.5px] !border-[#E6E6E6] font-sans text-[14px] !bg-white focus-within:!border-[#0047CC] focus-within:!ring-[3px] focus-within:!ring-[#0047CC]/10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio links — rendered only when the API enables them */}
        {showLinks && (
          <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[16px] p-[24px_26px] mb-[16px] relative overflow-visible transition-all duration-250 z-10">
            <div className="flex items-start justify-between gap-[14px] mb-[14px]">
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-[7px] mb-[8px]">
                  <div className="w-[26px] h-[26px] rounded-full bg-[#0047CC] text-white font-[900] text-[12px] flex items-center justify-center shrink-0">{linksSectionIdx}</div>
                  <div className="text-[10.5px] font-[800] tracking-[0.7px] uppercase text-[#0047CC]">{companyName} is asking for</div>
                </div>
                <div className="text-[17px] font-[800] text-[#1A1A1A] tracking-[-0.2px] leading-[1.3] mb-[5px]">
                  Anything else you&apos;d like {companyName} to see
                </div>
                <div className="text-[13px] text-[#808080] leading-[1.55]">
                  Conference talks, podcasts, published articles, blog posts, social campaigns you led. Public links only. Up to 5.
                </div>
              </div>
              <span className="bg-[#F7F7F7] text-[#808080] text-[10.5px] font-[800] px-[9px] py-[3px] rounded-full tracking-[0.4px] uppercase shrink-0 whitespace-nowrap">
                Optional
              </span>
            </div>

            <div className="text-[12px] text-[#4A4A4A] leading-[1.55] bg-[#EBF6FF] p-[9px_12px] rounded-[8px] mb-[14px]">
              <strong className="font-[800] text-[#182348]">Why we ask:</strong> to surface work that might not sit on your CV.
            </div>

            <div className="mt-[14px]">
              {portfolioUrls.map((url, idx) => (
                <div key={idx} className="bg-[#F7F7F7] rounded-[10px] p-[11px_13px] flex items-center gap-[10px] mb-[8px] text-[13px] text-[#1A1A1A]">
                  <LinkIcon className="w-[14px] h-[14px] text-[#0047CC] shrink-0" />
                  <span className="flex-1 text-[#0047CC] font-[700] text-[12.5px] break-all">{url}</span>
                  <button
                    type="button"
                    className="p-[4px] rounded-[6px] text-[#808080] hover:text-[#DC2626] hover:bg-[#E6E6E6] transition-colors cursor-pointer"
                    title="Remove"
                    onClick={async () => {
                      const nextUrls = portfolioUrls.filter((_, i) => i !== idx);
                      setPortfolioUrls(nextUrls);
                      try {
                        await updateLinks.mutateAsync({ urls: nextUrls, roleLink: roleSlug });
                        toast.success('Link removed');
                        refetch();
                      } catch (err: any) {
                        toast.error(err?.message || 'Failed to remove link');
                      }
                    }}
                  >
                    <Trash2Icon className="w-[14px] h-[14px]" />
                  </button>
                </div>
              ))}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newUrl.trim()) return;
                  const nextUrls = [...portfolioUrls, newUrl.trim()];
                  setPortfolioUrls(nextUrls);
                  setNewUrl('');
                  try {
                    await updateLinks.mutateAsync({ urls: nextUrls, roleLink: roleSlug });
                    toast.success('Link added');
                    refetch();
                  } catch (err: any) {
                    toast.error(err?.message || 'Failed to add link');
                  }
                }}
                className="flex gap-[8px] mt-[8px]"
              >
                <input
                  type="url"
                  placeholder="Paste a URL (LinkedIn article, blog, podcast, talk...)"
                  className="flex-1 font-sans text-[14px] border-[1.5px] border-[#E6E6E6] rounded-[10px] p-[11px_13px] bg-white text-[#1A1A1A] focus:outline-none focus:border-[#0047CC] focus:ring-[3px] focus:ring-[#0047CC]/10 transition-all"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-[#0047CC] text-white border-none rounded-[10px] px-[18px] py-[11px] font-sans text-[13px] font-[700] cursor-pointer hover:bg-[#344DA1] transition-colors whitespace-nowrap"
                >
                  Add link
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Consents */}
        <div className="bg-white border border-[#0047CC]/30 rounded-[14px] p-[20px_22px] mt-[8px] mb-[8px]">
          <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-[14px]">
            Acknowledgements before submission
          </div>

          <div className="flex gap-[11px] items-start py-[10px]">
            <div 
              className={`mt-[2px] w-[18px] h-[18px] rounded-[5px] border-[1.5px] cursor-pointer flex items-center justify-center transition-all shrink-0 ${consents.truthful ? 'bg-[#0047CC] border-[#0047CC]' : 'bg-white border-[#0047CC]'}`}
              onClick={() => handleConsentToggle('truthful')}
            >
              {consents.truthful && (
                <div className="w-[5px] h-[9px] border-r-[2px] border-b-[2px] border-white rotate-45 mb-[2px]" />
              )}
            </div>
            <div className="text-[13px] text-[#182348] leading-[1.55] flex-1">
              I confirm everything I&apos;ve submitted above is <strong className="font-[800]">truthful and reflects my own work</strong>. Misrepresentation can result in immediate disqualification.
            </div>
          </div>

          <div className="flex gap-[11px] items-start py-[10px] border-t border-[#0047CC]/10">
            <div 
              className={`mt-[2px] w-[18px] h-[18px] rounded-[5px] border-[1.5px] cursor-pointer flex items-center justify-center transition-all shrink-0 ${consents.usage ? 'bg-[#0047CC] border-[#0047CC]' : 'bg-white border-[#0047CC]'}`}
              onClick={() => handleConsentToggle('usage')}
            >
              {consents.usage && (
                <div className="w-[5px] h-[9px] border-r-[2px] border-b-[2px] border-white rotate-45 mb-[2px]" />
              )}
            </div>
            <div className="text-[13px] text-[#182348] leading-[1.55] flex-1">
              I consent to my submissions being used by ORA and {companyName} <strong className="font-[800]">solely to shape and assess my interviews for this role</strong>. Files are encrypted and not shared beyond this hiring loop.
            </div>
          </div>

          <div className="flex gap-[11px] items-start py-[10px] border-t border-[#0047CC]/10">
            <div 
              className={`mt-[2px] w-[18px] h-[18px] rounded-[5px] border-[1.5px] cursor-pointer flex items-center justify-center transition-all shrink-0 ${consents.references ? 'bg-[#0047CC] border-[#0047CC]' : 'bg-white border-[#0047CC]'}`}
              onClick={() => handleConsentToggle('references')}
            >
              {consents.references && (
                <div className="w-[5px] h-[9px] border-r-[2px] border-b-[2px] border-white rotate-45 mb-[2px]" />
              )}
            </div>
            <div className="text-[13px] text-[#182348] leading-[1.55] flex-1">
              I understand my <strong className="font-[800]">references will only be contacted if I reach Stage 4</strong>, and I&apos;ll be notified before any contact is made.
            </div>
          </div>
        </div>

      </main>

      <footer className="fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-[10px] border-t border-[#E6E6E6] p-[14px_32px] flex items-center justify-between gap-[12px] z-[50]">
        <div className="text-[12.5px] text-[#4A4A4A] font-[600] flex items-center gap-[10px]">
          <span className="text-[#0047CC] text-[12.5px] font-[800]">
            {completedRequired} of {totalRequired} done
          </span>
          {canFinalize ? 'All requirements met! Ready to submit.' : 'Please complete all required items before submitting.'}
        </div>
        <div className="flex gap-[10px]">
          <button 
            type="button"
            onClick={handleSaveAndExit}
            className="bg-white text-[#4A4A4A] border-[1.5px] border-[#E6E6E6] rounded-full px-[20px] py-[13px] text-[14px] font-[700] hover:border-[#ADADAD] transition-colors cursor-pointer"
          >
            Save and exit
          </button>
          <button 
            type="button"
            disabled={!canFinalize || completePreAssessment.isPending}
            onClick={handleSubmit}
            className={`rounded-full px-[26px] py-[13px] text-[14px] font-[700] cursor-pointer font-sans inline-flex items-center gap-[8px] transition-all border-none ${
              canFinalize 
                ? 'bg-[#0047CC] text-white shadow-[0_4px_14px_rgba(0,71,204,0.28)] hover:bg-[#344DA1] hover:-translate-y-[1px]' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {completePreAssessment.isPending ? 'Submitting...' : 'Submit and open Stage 1'}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default RoleEmployerAsks;
