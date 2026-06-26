import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import { CloseIcon } from '../../components/common/Icons';
import RoleApplyContextStrip from '../../components/talent/cvUpload/RoleApplyContextStrip';
import AuthCenterLogoNav from '../../components/auth/AuthCenterLogoNav';
import CvUploadZone from '../../components/talent/cvUpload/CvUploadZone';
import CvUploadedFileRow from '../../components/talent/cvUpload/CvUploadedFileRow';
import { useUploadCvMutation, useGetPublicRoleQuery, useGetRoleCvStatusQuery } from '../../services/queries/talent';
import { getRoleLandingForSlug, mapApiResponseToRoleData } from '../../utils/roleLanding';
import type { PublicRoleLandingData } from '../../types/roleLanding';
import { loadRoleApplySlug } from '../../utils/roleSignup';
import { ROLE_CV_UPLOAD_PATH } from '../../utils/cvUpload';

const RoleCvUpload: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ roleSlug: string }>();
  const roleSlug = params.roleSlug || '';
  const firstName = (location.state as { firstName?: string } | null)?.firstName ?? '';

  const { data: response, isLoading: isRoleLoading } = useGetPublicRoleQuery(roleSlug || '');
  const uploadCvMutation = useUploadCvMutation();
  const [isPolling, setIsPolling] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Poll the lightweight cv/status endpoint — only after a successful upload.
  const { data: cvStatusData } = useGetRoleCvStatusQuery(roleSlug, {
    enabled: isPolling,
    refetchInterval: isPolling ? 2000 : false,
  });

  const activeCvStatus =
    (cvStatusData?.data?.parseStatus ?? cvStatusData?.parseStatus) as string | undefined;

  const role: PublicRoleLandingData | null = useMemo(() => {
    if (!roleSlug) return null;
    const apiData = response?.data || response;
    if (!apiData || Object.keys(apiData).length === 0) {
      return getRoleLandingForSlug(roleSlug);
    }
    return mapApiResponseToRoleData(roleSlug, apiData);
  }, [response, roleSlug]);

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!roleSlug) {
      navigate('/onboarding/talent?step=1', { replace: true });
    }
  }, [roleSlug, navigate]);

  useEffect(() => {
    if (activeCvStatus === 'COMPLETED') {
      setIsPolling(false);
      navigate(`/onboarding/talent/${roleSlug}/match`, {
        state: { firstName },
      });
    } else if (activeCvStatus === 'FAILED') {
      setIsPolling(false);
      setUploadError('CV parsing failed. Please ensure you uploaded a valid text-based PDF or DOCX file, and try again.');
    }
  }, [activeCvStatus, navigate, firstName, roleSlug]);

  if (!roleSlug || !role) {
    return null;
  }

  const handleCancel = () => {
    navigate('/onboarding/talent?step=2');
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploadError('');
    try {
      await uploadCvMutation.mutateAsync({ file, roleLink: roleSlug });
      setIsPolling(true);
    } catch (error: any) {
      setUploadError(error?.message || 'Failed to upload CV. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AuthCenterLogoNav />
      <RoleApplyContextStrip role={role} />

      <div className="flex-1 flex flex-col items-center pt-8 sm:pt-12 pb-24 px-4 sm:px-6">
        <div className="w-full max-w-[600px]">
          <div className="flex items-center gap-4 mb-8">
            <button
              type="button"
              onClick={handleCancel}
              className="text-[#808080] hover:text-[#1A1A1A] p-1 -ml-1 flex items-center cursor-pointer transition-colors shrink-0"
              aria-label="Cancel"
            >
              <CloseIcon size={24} strokeWidth={2.5} />
            </button>
            <h1 className="text-2xl sm:text-[28px] font-bold text-[#1A1A1A] tracking-tight">
              Upload CV
            </h1>
          </div>

          <p className="text-[15px] sm:text-base text-[#4A4A4A] leading-relaxed mb-8">
            VORA will combine your CV with your onboarding profile to build your full profile and
            check if you match for this role, and others that might fit.{' '}
            <strong className="text-[#1A1A1A] font-semibold">
              Don&apos;t match yet? No problem
            </strong>
            , we&apos;ll run a gap analysis and guide you step by step until you do.
          </p>

          {uploadError ? (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm font-medium">
              {uploadError}
            </div>
          ) : null}

          <CvUploadZone file={file} onFileSelect={setFile} disabled={isPolling || uploadCvMutation.isPending} />
          {file ? <CvUploadedFileRow file={file} onRemove={() => setFile(null)} disabled={isPolling || uploadCvMutation.isPending} /> : null}

          <div className="mt-10">
            <Button
              type="button"
              variant={file ? 'primary' : 'secondary'}
              disabled={!file || isPolling || uploadCvMutation.isPending}
              isLoading={isPolling || uploadCvMutation.isPending}
              onClick={handleSubmit}
              className="w-full md:min-w-[200px]"
            >
              {isPolling ? 'Analyzing your CV...' : 'Check if I match'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ROLE_CV_UPLOAD_PATH };
export default RoleCvUpload;
