import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import {
  UploadIcon,
  CloseIcon,
  AlertTriangleIcon,
  FileIcon,
} from '../../components/common/Icons';
import {
  useTalentDashboardQuery,
  useTalentSkillsLedgerQuery,
  useTalentMatchesRolesQuery,
  useTalentProgressQuery,
  useTalentMyDataQuery,
  useTalentCareerMapQuery,
  useDeleteTalentDataMutation,
  useUploadCvMutation,
  useGetTalentCvProfileQuery,
} from '../../services/queries/talent';
import { OverviewTab } from './profile-tabs/OverviewTab';
import { CareerMapTab } from './profile-tabs/CareerMapTab';
import { SkillsLedgerTab } from './profile-tabs/SkillsLedgerTab';
import { MatchesRolesTab } from './profile-tabs/MatchesRolesTab';
import { ProgressViewTab } from './profile-tabs/ProgressViewTab';
import { MyDataTab } from './profile-tabs/MyDataTab';

type TabType = 'overview' | 'careermap' | 'ledger' | 'matches' | 'progress' | 'data';

const VALID_TABS: TabType[] = ['overview', 'careermap', 'ledger', 'matches', 'progress', 'data'];

const TalentMyProfile: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const cvInputRef = useRef<HTMLInputElement>(null);

  // Tab State with URL query sync (?tab=careermap)
  const tabFromUrl = searchParams.get('tab') as TabType;
  const [activeTab, setActiveTab] = useState<TabType>(
    VALID_TABS.includes(tabFromUrl) ? tabFromUrl : 'overview'
  );

  useEffect(() => {
    const currentParam = searchParams.get('tab') as TabType;
    if (currentParam && VALID_TABS.includes(currentParam) && currentParam !== activeTab) {
      setActiveTab(currentParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (tab === 'overview') {
          next.delete('tab');
        } else {
          next.set('tab', tab);
        }
        return next;
      },
      { replace: true }
    );
  };

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [cvNote, setCvNote] = useState('');

  // CV upload & Parsing state
  const [selectedCvFile, setSelectedCvFile] = useState<File | null>(null);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [isParsingCv, setIsParsingCv] = useState(false);
  const [isPollingCvProfile, setIsPollingCvProfile] = useState(false);

  // 1) Dashboard query (always loaded for header identity, score, unlocks)
  const {
    data: dashboardResponse,
    isLoading: isDashboardLoading,
  } = useTalentDashboardQuery();
  const dashboard = dashboardResponse?.data;

  // 2) Per-tab queries
  const {
    data: careerMapResponse,
    isLoading: isCareerMapLoading,
  } = useTalentCareerMapQuery();
  const careerMapData = careerMapResponse?.data;

  const {
    data: skillsLedgerResponse,
    isLoading: isLedgerLoading,
  } = useTalentSkillsLedgerQuery({
    enabled: activeTab === 'ledger',
  });
  const skillsLedger = skillsLedgerResponse?.data;

  const {
    data: matchesRolesResponse,
    isLoading: isMatchesLoading,
  } = useTalentMatchesRolesQuery({
    enabled: activeTab === 'matches',
  });
  const matchesRoles = matchesRolesResponse?.data;

  const {
    data: progressResponse,
    isLoading: isProgressLoading,
  } = useTalentProgressQuery({
    enabled: activeTab === 'progress',
  });
  const progressData = progressResponse?.data;

  const {
    data: myDataResponse,
    isLoading: isMyDataLoading,
  } = useTalentMyDataQuery({
    enabled: activeTab === 'data',
  });
  const myData = myDataResponse?.data;

  // Mutations
  const uploadCvMutation = useUploadCvMutation();
  const deleteTalentDataMutation = useDeleteTalentDataMutation();

  // Poll CV parsing
  const { data: cvProfileData } = useGetTalentCvProfileQuery({
    enabled: isPollingCvProfile,
    refetchInterval: isPollingCvProfile ? 2500 : false,
  });

  useEffect(() => {
    if (!isPollingCvProfile || !cvProfileData) return;
    const raw = (cvProfileData as any).data ?? cvProfileData;
    const parseStatus = raw?.parseStatus;

    if (parseStatus === 'COMPLETED') {
      setIsPollingCvProfile(false);
      setIsParsingCv(false);
      toast.dismiss('cv-parsing');
      toast.success('CV uploaded and parsed successfully! Skills Ledger updated.');
      queryClient.invalidateQueries({ queryKey: ['talent-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['talent', 'skills-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['talent', 'my-data'] });
      queryClient.invalidateQueries({ queryKey: ['talent', 'cv-profile'] });
    } else if (parseStatus === 'FAILED') {
      setIsPollingCvProfile(false);
      setIsParsingCv(false);
      toast.dismiss('cv-parsing');
      toast.error('CV parsing could not extract details. Please verify your file.');
    }
  }, [cvProfileData, isPollingCvProfile, queryClient]);

  const handleCvFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE_BYTES) {
      toast.error('File size exceeds 2MB limit. Please choose a file up to 2MB.');
      if (cvInputRef.current) cvInputRef.current.value = '';
      return;
    }
    setSelectedCvFile(file);
  };

  const handleExecuteUploadCv = async () => {
    if (!selectedCvFile) {
      cvInputRef.current?.click();
      return;
    }

    const MAX_SIZE_BYTES = 2 * 1024 * 1024;
    if (selectedCvFile.size > MAX_SIZE_BYTES) {
      toast.error('File size exceeds 2MB limit. Please choose a file up to 2MB.');
      return;
    }

    setIsUploadingCv(true);
    setIsParsingCv(true);

    try {
      const res = await uploadCvMutation.mutateAsync({ file: selectedCvFile });
      const parseStatus = (res as any)?.data?.parseStatus || (res as any)?.parseStatus;

      // Close modal and reset state on successful upload submission
      setIsUploadModalOpen(false);
      setSelectedCvFile(null);
      setCvNote('');
      if (cvInputRef.current) cvInputRef.current.value = '';

      if (parseStatus === 'COMPLETED') {
        setIsParsingCv(false);
        queryClient.invalidateQueries({ queryKey: ['talent-dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['talent', 'skills-ledger'] });
        queryClient.invalidateQueries({ queryKey: ['talent', 'my-data'] });
        queryClient.invalidateQueries({ queryKey: ['talent', 'cv-profile'] });
        toast.success('CV uploaded and parsed successfully! Ledger updated.');
      } else {
        setIsPollingCvProfile(true);
        toast.loading('Analyzing CV and updating ledger...', { id: 'cv-parsing' });
      }
    } catch (err: any) {
      setIsParsingCv(false);
      toast.error(err?.message || 'Failed to upload CV');
    } finally {
      setIsUploadingCv(false);
    }
  };

  const handleCloseUploadModal = () => {
    if (isUploadingCv) return;
    setIsUploadModalOpen(false);
    setSelectedCvFile(null);
    setCvNote('');
    if (cvInputRef.current) cvInputRef.current.value = '';
  };

  const handleExecuteDelete = async () => {
    if (deleteConfirmText.trim() !== 'DELETE MY DATA') {
      toast.error('Please type DELETE MY DATA exactly to confirm.');
      return;
    }

    try {
      const res = await deleteTalentDataMutation.mutateAsync();
      const msg =
        (res as any)?.data?.message ||
        res?.message ||
        'Your data deletion request has been queued.';
      toast.success(msg);
      setIsDeleteModalOpen(false);
      setDeleteConfirmText('');
      queryClient.invalidateQueries({ queryKey: ['talent', 'my-data'] });
      queryClient.invalidateQueries({ queryKey: ['talent-dashboard'] });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit deletion request.');
    }
  };

  const cvUnlock = dashboard?.unlocks?.uploadCv;
  const isCvLocked = cvUnlock?.locked === true;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-28">
      {/* Hidden CV file input */}
      <input
        type="file"
        ref={cvInputRef}
        onChange={handleCvFileSelected}
        accept=".pdf,.doc,.docx"
        className="hidden"
      />

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Talent Profile
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {dashboard?.greeting?.welcomeMessage ||
              'Your dynamic career dossier, verified skills ledger, and role eligibility status.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={isCvLocked || isParsingCv}
            onClick={() => {
              if (cvUnlock?.hrefHint && cvUnlock.hrefHint !== '/talent/settings/cv') {
                navigate(cvUnlock.hrefHint);
              } else {
                setIsUploadModalOpen(true);
              }
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors shadow-2xs ${
              isCvLocked
                ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60'
                : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 cursor-pointer'
            }`}
          >
            <UploadIcon size={14} className="text-[#0047CC]" />
            <span>{isParsingCv ? 'Processing CV...' : cvUnlock?.label || 'Update CV'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('careermap')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-2xs transition-colors ${
              activeTab === 'careermap'
                ? 'bg-[#0047CC] text-white'
                : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200'
            }`}
          >
            <span>Career Map</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('progress')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0047CC] hover:bg-[#003bb5] text-white text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
          >
            <span>View Progress</span>
          </button>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-gray-100/80 rounded-2xl border border-gray-200/80 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleTabChange('overview')}
          className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-white text-[#0047CC] shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('careermap')}
          className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'careermap'
              ? 'bg-white text-[#0047CC] shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          Career Map
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('ledger')}
          className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ledger'
              ? 'bg-white text-[#0047CC] shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          Skills Ledger
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('matches')}
          className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'matches'
              ? 'bg-white text-[#0047CC] shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          Matches &amp; Roles
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('progress')}
          className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'progress'
              ? 'bg-white text-[#0047CC] shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          Progress View
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('data')}
          className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'data'
              ? 'bg-white text-[#0047CC] shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          My Data
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'overview' && (
        <OverviewTab
          dashboard={dashboard}
          careerMap={careerMapData}
          isLoading={isDashboardLoading}
          onNavigateTab={handleTabChange}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
        />
      )}

      {activeTab === 'careermap' && (
        <CareerMapTab
          data={careerMapData}
          profile={dashboard?.profile}
          isLoading={isCareerMapLoading}
        />
      )}

      {activeTab === 'ledger' && (
        <SkillsLedgerTab data={skillsLedger} isLoading={isLedgerLoading} />
      )}

      {activeTab === 'matches' && (
        <MatchesRolesTab data={matchesRoles} isLoading={isMatchesLoading} />
      )}

      {activeTab === 'progress' && (
        <ProgressViewTab data={progressData} isLoading={isProgressLoading} />
      )}

      {activeTab === 'data' && (
        <MyDataTab
          data={myData}
          isLoading={isMyDataLoading}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
          onOpenDeleteModal={() => setIsDeleteModalOpen(true)}
        />
      )}

      {/* MODAL: UPLOAD CV */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Update Your CV</h3>
              <button
                type="button"
                disabled={isUploadingCv}
                onClick={handleCloseUploadModal}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-900">
              <span className="font-bold">!</span>
              <span>
                <strong>Skills Ledger update:</strong> Uploading a new CV refreshes your profile extraction and re-evaluates all matched and reach roles across VORA.
              </span>
            </div>

            {selectedCvFile ? (
              <div className="border border-blue-200 bg-blue-50/40 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0047CC] flex items-center justify-center shrink-0 border border-blue-200">
                    <FileIcon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 truncate">{selectedCvFile.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {(selectedCvFile.size / (1024 * 1024)).toFixed(2)} MB · Ready to upload
                    </p>
                  </div>
                </div>
                {!isUploadingCv && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCvFile(null);
                      if (cvInputRef.current) cvInputRef.current.value = '';
                    }}
                    className="px-2.5 py-1 text-xs font-semibold text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    Change file
                  </button>
                )}
              </div>
            ) : (
              <div
                onClick={() => !isUploadingCv && cvInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-gray-50/50 space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0047CC] flex items-center justify-center mx-auto border border-blue-100">
                  <UploadIcon size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Choose file to upload</p>
                  <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, DOCX · Max 2MB</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Note (optional)</label>
              <input
                type="text"
                disabled={isUploadingCv}
                value={cvNote}
                onChange={(e) => setCvNote(e.target.value)}
                placeholder="e.g. Updated with recent healthcare analytics project"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-[#0047CC] disabled:bg-gray-100 disabled:opacity-60"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                disabled={isUploadingCv}
                onClick={handleCloseUploadModal}
                className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUploadingCv}
                onClick={selectedCvFile ? handleExecuteUploadCv : () => cvInputRef.current?.click()}
                className={`inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-xs transition-colors ${
                  isUploadingCv
                    ? 'bg-blue-400 cursor-not-allowed opacity-80'
                    : 'bg-[#0047CC] hover:bg-[#003bb5] cursor-pointer'
                }`}
              >
                {isUploadingCv ? (
                  <>
                    <Spinner size={14} className="text-white" />
                    <span>Uploading...</span>
                  </>
                ) : selectedCvFile ? (
                  <span>Upload CV</span>
                ) : (
                  <span>Select File</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE ALL DATA (QUEUED AUDIT-LOGGED REQUEST) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl border border-rose-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangleIcon size={18} />
                <h3 className="text-lg font-bold">Request Data Deletion</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmText('');
                }}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2 text-xs text-rose-900">
              <span className="font-bold">!</span>
              <span>
                <strong>Audit-logged pipeline request.</strong> Submitting this request queues your account data for verified deletion under data privacy regulations.
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Upon final processing of this request, your Skills Ledger, CV dossiers, and application history will be erased from platform matching.
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Type <strong className="text-rose-700">DELETE MY DATA</strong> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE MY DATA"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-rose-600 font-bold"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmText('');
                }}
                className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  deleteConfirmText.trim() !== 'DELETE MY DATA' ||
                  deleteTalentDataMutation.isPending
                }
                onClick={handleExecuteDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleteTalentDataMutation.isPending ? 'Queuing Request...' : 'Submit Deletion Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TalentMyProfile;
