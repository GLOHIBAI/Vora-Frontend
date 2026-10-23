import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import AlertBanner from '../../components/common/AlertBanner';
import { Subheading } from '../../components/common/Typography';
import FormSectionCard from '../../components/common/FormSectionCard';
import TrackedField, { changedInputClass } from '../../components/common/TrackedField';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import ScrollArea from '../../components/common/ScrollArea';
import PageActionBar from '../../components/common/PageActionBar';
import ModalDialog from '../../components/common/ModalDialog';
import PageTopBackBar from '../../components/common/PageTopBackBar';
import { LockIcon } from '../../components/common/Icons';
import EditAllowanceMeter from '../../components/vault/EditAllowanceMeter';
import ChangeSummaryList from '../../components/vault/ChangeSummaryList';
import EscrowRecalcCard from '../../components/vault/EscrowRecalcCard';
import {
  DEFAULT_VAULT_EDIT_ORIGINAL,
  VAULT_EDIT_ALLOWANCE,
  VAULT_ORIGINAL_ESCROW,
} from '../../constants/vaultEdit';
import {
  ROLE_TYPE_GROUPS,
  WORK_FORMAT_OPTIONS,
  EXPERIENCE_YEARS_OPTIONS,
  MIN_QUALIFICATION_OPTIONS,
  INT_POLICY_ELIGIBILITY_OPTIONS,
} from '../../constants/jobWizard';
import type { VaultEditOriginal, VaultEditChange } from '../../types/vaultEdit';
import { calcEscrowRecalc } from '../../utils/vaultEscrow';
import { buildVaultEditReviewData, saveVaultEditReview, buildChangesFromEdit } from '../../utils/vaultEditReview';
import {
  useGetRolePostingQuery,
  useEditVaultRoleMutation,
  useVaultPreQualifiedCountQuery,
  rolePostingKeys,
} from '../../services/queries/rolePostings';

const COMP_TYPE_OPTIONS = [
  { label: 'Annual salary', value: 'Annual salary' },
  { label: 'Monthly salary', value: 'Monthly salary' },
  { label: 'Daily rate (annualised)', value: 'Daily rate (annualised)' },
  { label: 'Annual stipend / fellowship', value: 'Annual stipend / fellowship' },
];

const isValidUuid = (val?: string | null): boolean =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

const EditVaultRole: React.FC = () => {
  const navigate = useNavigate();
  const { id: jobId } = useParams();
  const queryClient = useQueryClient();
  const isUuid = isValidUuid(jobId);

  useEffect(() => {
    if (jobId && !isUuid) {
      toast.error(`Invalid role ID: ${jobId}. Please select a valid role from Jobs.`);
      navigate('/jobs');
    }
  }, [jobId, isUuid, navigate]);

  const { data: roleResponse } = useGetRolePostingQuery(jobId || '', { enabled: isUuid });
  const { data: preQualifiedCountData } = useVaultPreQualifiedCountQuery(jobId || '', { enabled: isUuid });
  const editVaultMutation = useEditVaultRoleMutation();

  const preQualifiedCount =
    (preQualifiedCountData as any)?.data?.count ?? (preQualifiedCountData as any)?.count ?? 0;

  const [original, setOriginal] = useState<VaultEditOriginal>(DEFAULT_VAULT_EDIT_ORIGINAL);
  const [form, setForm] = useState<VaultEditOriginal>({ ...DEFAULT_VAULT_EDIT_ORIGINAL });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [customRoleText, setCustomRoleText] = useState('');
  const [showCustomRoleInput, setShowCustomRoleInput] = useState(false);

  useEffect(() => {
    if (roleResponse?.data) {
      const rd: any = roleResponse.data;
      const loaded: VaultEditOriginal = {
        roleType: rd.roleType || DEFAULT_VAULT_EDIT_ORIGINAL.roleType,
        roleTitle: rd.roleTitle || DEFAULT_VAULT_EDIT_ORIGINAL.roleTitle,
        location: rd.workLocationPrimary || DEFAULT_VAULT_EDIT_ORIGINAL.location,
        workFormat: rd.workFormat || DEFAULT_VAULT_EDIT_ORIGINAL.workFormat,
        positions: rd.positionsAvailable ? String(rd.positionsAvailable) : DEFAULT_VAULT_EDIT_ORIGINAL.positions,
        goLiveDate: rd.scheduledGoLiveDate || DEFAULT_VAULT_EDIT_ORIGINAL.goLiveDate,
        startDate: rd.startDate || DEFAULT_VAULT_EDIT_ORIGINAL.startDate,
        roleGoal: rd.roleGoal || DEFAULT_VAULT_EDIT_ORIGINAL.roleGoal,
        responsibilities: rd.coreResponsibilities || DEFAULT_VAULT_EDIT_ORIGINAL.responsibilities,
        skills: Array.isArray(rd.technicalSkills) ? rd.technicalSkills.join(', ') : (rd.technicalSkills || DEFAULT_VAULT_EDIT_ORIGINAL.skills),
        tools: Array.isArray(rd.toolsRequired) ? rd.toolsRequired.join(', ') : (rd.toolsRequired || DEFAULT_VAULT_EDIT_ORIGINAL.tools),
        languages: Array.isArray(rd.languageRequirements) ? rd.languageRequirements.join(', ') : DEFAULT_VAULT_EDIT_ORIGINAL.languages,
        preAssessment: DEFAULT_VAULT_EDIT_ORIGINAL.preAssessment,
        experienceYears: rd.yearsExperienceRequired || DEFAULT_VAULT_EDIT_ORIGINAL.experienceYears,
        minQualification: rd.minimumQualification || DEFAULT_VAULT_EDIT_ORIGINAL.minQualification,
        intPolicy: rd.internationalTalentPolicy || DEFAULT_VAULT_EDIT_ORIGINAL.intPolicy,
        preferredProfile: rd.preferredTalentProfile || DEFAULT_VAULT_EDIT_ORIGINAL.preferredProfile,
        workingStyle: Array.isArray(rd.preferredWorkingStyle) ? rd.preferredWorkingStyle.join(', ') : DEFAULT_VAULT_EDIT_ORIGINAL.workingStyle,
        workCulture: Array.isArray(rd.workEnvironmentDescriptors) ? rd.workEnvironmentDescriptors.join(', ') : DEFAULT_VAULT_EDIT_ORIGINAL.workCulture,
        personalityTraits: Array.isArray(rd.personalityTraits) ? rd.personalityTraits.join(', ') : DEFAULT_VAULT_EDIT_ORIGINAL.personalityTraits,
        teamNotes: rd.teamCultureFreeText || DEFAULT_VAULT_EDIT_ORIGINAL.teamNotes,
        compType: DEFAULT_VAULT_EDIT_ORIGINAL.compType,
        salMin: rd.salaryMin ? String(rd.salaryMin) : DEFAULT_VAULT_EDIT_ORIGINAL.salMin,
        salMax: rd.salaryMax ? String(rd.salaryMax) : DEFAULT_VAULT_EDIT_ORIGINAL.salMax,
        benefits: DEFAULT_VAULT_EDIT_ORIGINAL.benefits,
      };
      setOriginal(loaded);
      setForm(loaded);
    }
  }, [roleResponse]);

  const patch = (key: keyof VaultEditOriginal, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };



  const changed = (key: keyof VaultEditOriginal) => form[key] !== original[key];

  const detailsChanged =
    changed('roleType') ||
    changed('roleTitle') ||
    changed('location') ||
    changed('workFormat') ||
    changed('positions') ||
    changed('goLiveDate') ||
    changed('startDate');

  const respChanged =
    changed('roleGoal') ||
    changed('responsibilities') ||
    changed('skills') ||
    changed('tools') ||
    changed('languages') ||
    changed('preAssessment');

  const expChanged =
    changed('experienceYears') ||
    changed('minQualification') ||
    changed('intPolicy') ||
    changed('preferredProfile');

  const teamChanged =
    changed('workingStyle') ||
    changed('workCulture') ||
    changed('personalityTraits') ||
    changed('teamNotes');

  const compChanged =
    changed('compType') ||
    changed('salMin') ||
    changed('salMax') ||
    changed('benefits') ||
    changed('positions');

  const showEscrowRecalc = changed('salMin') || changed('salMax') || changed('positions');

  const originalMidpoint = useMemo(() => {
    const min = parseFloat(original.salMin) || 0;
    const max = parseFloat(original.salMax) || 0;
    return min && max ? (min + max) / 2 : 0;
  }, [original.salMin, original.salMax]);

  const originalPositionsCount = useMemo(() => {
    return parseInt(original.positions, 10) || 1;
  }, [original.positions]);

  const originalEscrowAmount = useMemo(() => {
    if (originalMidpoint && originalPositionsCount) {
      return Math.round(originalPositionsCount * originalMidpoint * 0.15);
    }
    return VAULT_ORIGINAL_ESCROW;
  }, [originalMidpoint, originalPositionsCount]);

  const escrowRecalc = useMemo(
    () =>
      calcEscrowRecalc(
        parseFloat(form.salMin) || 0,
        parseFloat(form.salMax) || 0,
        parseInt(form.positions, 10) || 1,
        originalEscrowAmount,
        0.15,
        originalMidpoint,
        originalPositionsCount
      ),
    [form.salMin, form.salMax, form.positions, originalEscrowAmount, originalMidpoint, originalPositionsCount]
  );

  const [localEditLimitReached, setLocalEditLimitReached] = useState(false);

  const editsUsed = useMemo(() => {
    if (localEditLimitReached) return 3;
    const rd: any = roleResponse?.data || {};
    if (typeof rd.specificationEditCount === 'number') return rd.specificationEditCount;
    if (typeof rd.vaultEditCount === 'number') return rd.vaultEditCount;
    if (typeof rd.vaultEditsCount === 'number') return rd.vaultEditsCount;
    if (typeof rd.editsCount === 'number') return rd.editsCount;
    if (typeof rd.editsUsed === 'number') return rd.editsUsed;
    if (typeof rd.vaultEditsUsed === 'number') return rd.vaultEditsUsed;
    if (typeof rd.specificationEditsUsed === 'number') return rd.specificationEditsUsed;
    if (typeof rd.vaultEditAllowance?.used === 'number') return rd.vaultEditAllowance.used;
    if (typeof rd.editAllowance?.used === 'number') return rd.editAllowance.used;
    if (typeof rd.editsRemaining === 'number') return Math.max(0, 3 - rd.editsRemaining);
    if (typeof rd.vaultEditsRemaining === 'number') return Math.max(0, 3 - rd.vaultEditsRemaining);
    return 0;
  }, [roleResponse, localEditLimitReached]);

  const editsTotal = useMemo(() => {
    const rd: any = roleResponse?.data || {};
    if (typeof rd.vaultEditAllowance?.total === 'number') return rd.vaultEditAllowance.total;
    if (typeof rd.editAllowance?.total === 'number') return rd.editAllowance.total;
    if (typeof rd.editsTotal === 'number') return rd.editsTotal;
    if (typeof rd.maxVaultEdits === 'number') return rd.maxVaultEdits;
    return 3;
  }, [roleResponse]);

  const isAtEditLimit = editsUsed >= editsTotal;

  const summaryChanges = useMemo((): VaultEditChange[] => {
    return buildChangesFromEdit(original, form);
  }, [form, original]);

  const hasChanges =
    detailsChanged || respChanged || expChanged || teamChanged || compChanged;

  const vaultDashboardHref = jobId ? `/jobs/${jobId}` : '/jobs?tab=Scheduled';

  const handleSubmit = async () => {
    const changes: Record<string, any> = {};
    if (changed('roleTitle')) changes.roleTitle = form.roleTitle;
    if (changed('roleType')) changes.roleType = form.roleType;
    if (changed('location')) changes.workLocationPrimary = form.location;
    if (changed('workFormat')) changes.workFormat = form.workFormat;
    if (changed('positions')) changes.positionsAvailable = parseInt(form.positions, 10);
    if (changed('startDate')) changes.startDate = form.startDate;
    if (changed('roleGoal')) changes.roleGoal = form.roleGoal;
    if (changed('responsibilities')) changes.coreResponsibilities = form.responsibilities;
    if (changed('skills')) changes.technicalSkills = form.skills.split(',').map((s) => s.trim()).filter(Boolean);
    if (changed('tools')) changes.toolsRequired = form.tools.split(',').map((s) => s.trim()).filter(Boolean);
    if (changed('languages')) changes.languageRequirements = form.languages.split(',').map((s) => s.trim()).filter(Boolean);
    if (changed('experienceYears')) changes.yearsExperienceRequired = form.experienceYears;
    if (changed('minQualification')) changes.minimumQualification = form.minQualification;
    if (changed('intPolicy')) changes.internationalTalentPolicy = form.intPolicy;
    if (changed('preferredProfile')) changes.preferredTalentProfile = form.preferredProfile;
    if (changed('workingStyle')) changes.preferredWorkingStyle = form.workingStyle.split(',').map((s) => s.trim()).filter(Boolean);
    if (changed('workCulture')) changes.workEnvironmentDescriptors = form.workCulture.split(',').map((s) => s.trim()).filter(Boolean);
    if (changed('teamNotes')) changes.teamCultureFreeText = form.teamNotes;
    if (changed('salMin')) changes.salaryMin = parseFloat(form.salMin);
    if (changed('salMax')) changes.salaryMax = parseFloat(form.salMax);

    if (jobId) {
      try {
        await editVaultMutation.mutateAsync({ id: jobId, changes });
        queryClient.invalidateQueries({ queryKey: rolePostingKeys.detail(jobId) });
        setConfirmOpen(false);
        toast.success('Edit submitted for 48-hour review');
        const reviewData = buildVaultEditReviewData(form, original, escrowRecalc);
        saveVaultEditReview(reviewData);
        navigate(jobId ? `/jobs/vault/review/${jobId}` : '/jobs/vault/review');
      } catch (err: any) {
        const msg = err?.message || err?.data?.message || 'Failed to submit vault role edits';
        if (msg.toLowerCase().includes('maximum of 3') || msg.toLowerCase().includes('vault edit')) {
          setLocalEditLimitReached(true);
          setConfirmOpen(false);
        }
        toast.error(msg);
      }
    } else {
      toast.error('Role ID missing');
    }
  };

  return (
    <div className="-mx-4 lg:-mx-8 -mt-6 lg:-mt-10 flex flex-col min-h-[calc(100vh-80px)] bg-[#F7F7F7]">
      <PageTopBackBar
        to={vaultDashboardHref}
        label="Vault dashboard"
        trailing={
          <EditAllowanceMeter used={editsUsed} total={editsTotal} />
        }
      />

      <ScrollArea className="flex-1 min-h-0">
        <div className="w-full max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isAtEditLimit ? (
            <AlertBanner variant="red" className="mb-6">
              <strong>Specification edit limit reached.</strong> This vaulted role has already used all {editsTotal} of its {editsTotal} permitted specification edits. No further changes can be submitted before go-live.
            </AlertBanner>
          ) : (
            <AlertBanner variant="info" className="mb-6">
              <strong>You are editing a vaulted role specification.</strong> Every change you save here
              enters a 48-hour review window before taking effect. During that window, silent matching
              continues against the previous spec. Pre-qualified candidates built up so far ({preQualifiedCount}) remain valid.
              If you change the salary band, the escrow amount recalculates and a top-up or partial refund
              fires automatically. This counts as {Math.min(editsTotal, editsUsed + 1)} of your {editsTotal} permitted specification edits.
            </AlertBanner>
          )}

          <FormSectionCard title="Role details" changed={detailsChanged}>
            <TrackedField
              changed={changed('roleType')}
              changeMessage="Changed, matching will recalibrate after 48hr review"
            >
              <Select
                label="Role type"
                groups={ROLE_TYPE_GROUPS}
                value={showCustomRoleInput ? 'other' : form.roleType}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'other') {
                    const standardOptions = ROLE_TYPE_GROUPS.flatMap(g => g.options.map(o => o.value)).filter(v => v !== 'other');
                    const isStandard = standardOptions.includes(form.roleType);
                    const initialText = isStandard ? '' : form.roleType;
                    setCustomRoleText(initialText);
                    setShowCustomRoleInput(true);
                  } else {
                    patch('roleType', val);
                    setShowCustomRoleInput(false);
                  }
                }}
                className={changedInputClass(changed('roleType'))}
              />
              {showCustomRoleInput && (
                <div className="mt-3 flex gap-3 items-end">
                  <div className="flex-1">
                    <Input
                      label="Specify custom role type"
                      placeholder="e.g. Specialized Nurse Coordinator"
                      value={customRoleText}
                      onChange={(e) => setCustomRoleText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (customRoleText.trim()) {
                            patch('roleType', customRoleText.trim());
                            setShowCustomRoleInput(false);
                          }
                        }
                      }}
                      className={`${changedInputClass(changed('roleType'))} h-11 py-0`}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      if (customRoleText.trim()) {
                        patch('roleType', customRoleText.trim());
                        setShowCustomRoleInput(false);
                      }
                    }}
                    disabled={!customRoleText.trim()}
                    size="md"
                    pill={false}
                    variant="primary"
                    fullWidth={false}
                    className="h-11 min-h-0 py-0"
                  >
                    Add
                  </Button>
                </div>
              )}
            </TrackedField>
            <TrackedField
              changed={changed('roleTitle')}
              changeMessage={`Changed from "${original.roleTitle}"`}
            >
              <Input
                label="Role title"
                value={form.roleTitle}
                onChange={(e) => patch('roleTitle', e.target.value)}
                className={`h-11 ${changedInputClass(changed('roleTitle'))}`}
              />
            </TrackedField>
            <TrackedField changed={changed('location')} changeMessage="Changed">
              <Input
                label="Work location"
                value={form.location}
                onChange={(e) => patch('location', e.target.value)}
                className={`h-11 ${changedInputClass(changed('location'))}`}
              />
            </TrackedField>
            <TrackedField changed={changed('workFormat')} changeMessage="Changed">
              <Select
                label="Work format"
                options={WORK_FORMAT_OPTIONS}
                value={form.workFormat}
                onChange={(e) => patch('workFormat', e.target.value)}
                className={changedInputClass(changed('workFormat'))}
              />
            </TrackedField>
            <TrackedField
              changed={changed('positions')}
              changeMessage="Changed, escrow will recalculate"
            >
              <Input
                label="Available positions"
                type="number"
                min={1}
                value={form.positions}
                onChange={(e) => patch('positions', e.target.value)}
                className={`max-w-[200px] h-11 ${changedInputClass(changed('positions'))}`}
              />
            </TrackedField>
            <TrackedField
              changed={changed('goLiveDate')}
              changeMessage="Changed, silent matching criteria updates after 48hr review"
            >
              <Input
                label="Go-live date"
                type="date"
                value={form.goLiveDate}
                onChange={(e) => patch('goLiveDate', e.target.value)}
                className={`max-w-[240px] h-11 ${changedInputClass(changed('goLiveDate'))}`}
              />
              <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">
                Extending your go-live date is allowed. Bringing it closer may require VORA approval if
                the window is under 30 days.
              </p>
            </TrackedField>
            <TrackedField changed={changed('startDate')} changeMessage="Changed">
              <Input
                label={
                  <span className="flex items-center gap-1.5">
                    Start date <span className="text-xs text-slate-400 font-normal">Optional</span>
                  </span>
                }
                type="date"
                value={form.startDate}
                onChange={(e) => patch('startDate', e.target.value)}
                className={`max-w-[240px] h-11 ${changedInputClass(changed('startDate'))}`}
              />
            </TrackedField>
          </FormSectionCard>

          <FormSectionCard title="Responsibilities & skills" changed={respChanged}>
            <TrackedField changed={changed('roleGoal')} changeMessage="Changed">
              <Textarea
                label="Role goal / problem to solve"
                value={form.roleGoal}
                onChange={(e) => patch('roleGoal', e.target.value)}
                className={changedInputClass(changed('roleGoal'))}
                rows={4}
              />
            </TrackedField>
            <TrackedField
              changed={changed('responsibilities')}
              changeMessage="Changed, matching engine will recalibrate after 48hr review"
            >
              <Textarea
                label="Core responsibilities"
                value={form.responsibilities}
                onChange={(e) => patch('responsibilities', e.target.value)}
                className={changedInputClass(changed('responsibilities'))}
                rows={5}
              />
            </TrackedField>
            <TrackedField changed={changed('skills')} changeMessage="Changed, matching will recalibrate">
              <Textarea
                label="Technical skills required"
                value={form.skills}
                onChange={(e) => patch('skills', e.target.value)}
                className={`min-h-[72px] ${changedInputClass(changed('skills'))}`}
                placeholder="Comma-separated skills"
                rows={2}
              />
              <p className="text-[13px] text-slate-500 mt-1.5">
                Edit as comma-separated values. Changes recalibrate candidate skill-match scoring after
                48hr review.
              </p>
            </TrackedField>
            <TrackedField changed={changed('tools')} changeMessage="Changed">
              <Textarea
                label="Tools / software required"
                value={form.tools}
                onChange={(e) => patch('tools', e.target.value)}
                className={`min-h-[72px] ${changedInputClass(changed('tools'))}`}
                placeholder="Comma-separated tools"
                rows={2}
              />
            </TrackedField>
            <TrackedField changed={changed('languages')} changeMessage="Changed">
              <Textarea
                label="Language requirements"
                value={form.languages}
                onChange={(e) => patch('languages', e.target.value)}
                className={`min-h-[72px] ${changedInputClass(changed('languages'))}`}
                placeholder="Comma-separated languages"
                rows={2}
              />
            </TrackedField>
            <TrackedField changed={changed('preAssessment')} changeMessage="Changed">
              <Input
                label={
                  <span className="flex items-center gap-1.5">
                    Pre-interview submission required <span className="text-xs text-slate-400 font-normal">Optional</span>
                  </span>
                }
                value={form.preAssessment}
                onChange={(e) => patch('preAssessment', e.target.value)}
                className={`h-11 ${changedInputClass(changed('preAssessment'))}`}
              />
            </TrackedField>
          </FormSectionCard>

          <FormSectionCard title="Experience & background" changed={expChanged}>
            <TrackedField
              changed={changed('experienceYears')}
              changeMessage="Changed, matching re-scores affected candidates after review"
            >
              <Select
                label="Years of experience required"
                options={EXPERIENCE_YEARS_OPTIONS}
                value={form.experienceYears}
                onChange={(e) => patch('experienceYears', e.target.value)}
                className={`max-w-xs ${changedInputClass(changed('experienceYears'))}`}
              />
            </TrackedField>
            <TrackedField changed={changed('minQualification')} changeMessage="Changed">
              <Select
                label="Minimum qualification required"
                options={MIN_QUALIFICATION_OPTIONS}
                value={form.minQualification}
                onChange={(e) => patch('minQualification', e.target.value)}
                className={changedInputClass(changed('minQualification'))}
              />
            </TrackedField>
            <TrackedField
              changed={changed('intPolicy')}
              changeMessage="Changed, geopolitical eligibility will be re-run"
            >
              <Select
                label="International candidate policy"
                options={INT_POLICY_ELIGIBILITY_OPTIONS}
                value={form.intPolicy}
                onChange={(e) => patch('intPolicy', e.target.value)}
                className={changedInputClass(changed('intPolicy'))}
              />
              <p className="text-[13px] text-slate-500 mt-1.5">
                Changing this may affect the eligible candidate pool, VORA updates geopolitical
                eligibility after the 48hr review window.
              </p>
            </TrackedField>
            <TrackedField changed={changed('preferredProfile')} changeMessage="Changed">
              <Textarea
                label={
                  <span className="flex items-center gap-1.5">
                    Preferred candidate profile <span className="text-xs text-slate-400 font-normal">Optional</span>
                  </span>
                }
                value={form.preferredProfile}
                onChange={(e) => patch('preferredProfile', e.target.value)}
                className={changedInputClass(changed('preferredProfile'))}
                rows={3}
              />
            </TrackedField>
          </FormSectionCard>

          <FormSectionCard title="Team collaboration & communication" changed={teamChanged}>
            <TrackedField changed={changed('workingStyle')} changeMessage="Changed">
              <Textarea
                label="Preferred working style"
                value={form.workingStyle}
                onChange={(e) => patch('workingStyle', e.target.value)}
                className={`min-h-[72px] ${changedInputClass(changed('workingStyle'))}`}
                placeholder="Comma-separated styles"
                rows={2}
              />
            </TrackedField>
            <TrackedField changed={changed('workCulture')} changeMessage="Changed">
              <Textarea
                label="Work environment / culture"
                value={form.workCulture}
                onChange={(e) => patch('workCulture', e.target.value)}
                className={`min-h-[72px] ${changedInputClass(changed('workCulture'))}`}
                placeholder="Comma-separated descriptors"
                rows={2}
              />
            </TrackedField>
            <TrackedField changed={changed('personalityTraits')} changeMessage="Changed">
              <Textarea
                label="Personality traits sought"
                value={form.personalityTraits}
                onChange={(e) => patch('personalityTraits', e.target.value)}
                className={`min-h-[72px] ${changedInputClass(changed('personalityTraits'))}`}
                placeholder="Comma-separated traits"
                rows={2}
              />
            </TrackedField>
            <TrackedField changed={changed('teamNotes')} changeMessage="Changed">
              <Textarea
                label={
                  <span className="flex items-center gap-1.5">
                    Additional notes on team / environment <span className="text-xs text-slate-400 font-normal">Optional</span>
                  </span>
                }
                value={form.teamNotes}
                onChange={(e) => patch('teamNotes', e.target.value)}
                className={changedInputClass(changed('teamNotes'))}
                rows={3}
              />
            </TrackedField>
          </FormSectionCard>

          <FormSectionCard
            title="Compensation"
            changed={compChanged}
            changedLabel={showEscrowRecalc ? 'Changed, escrow recalculation triggered' : 'Changed'}
          >
            <TrackedField
              changed={changed('compType')}
              changeMessage="Changed, escrow will be fully recalculated"
            >
              <Select
                label="Compensation structure type"
                options={COMP_TYPE_OPTIONS}
                value={form.compType}
                onChange={(e) => patch('compType', e.target.value)}
                className={changedInputClass(changed('compType'))}
              />
              <p className="text-[13px] text-slate-500 mt-1.5">
                Changing compensation structure type triggers a full escrow recalculation. Your existing
                escrow will be adjusted within 24 hours of this edit being confirmed.
              </p>
            </TrackedField>
            <TrackedField
              changed={changed('salMin') || changed('salMax')}
              changeMessage="Salary band changed, escrow adjustment will be calculated"
            >
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Salary range
              </label>
              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center max-w-md">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400 select-none z-10">
                    USD
                  </span>
                  <Input
                    label=""
                    type="number"
                    value={form.salMin}
                    onChange={(e) => patch('salMin', e.target.value)}
                    className={`pl-14 h-11 ${changedInputClass(changed('salMin') || changed('salMax'))}`}
                    placeholder="Min"
                  />
                </div>
                <span className="text-sm font-semibold text-slate-400">to</span>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400 select-none z-10">
                    USD
                  </span>
                  <Input
                    label=""
                    type="number"
                    value={form.salMax}
                    onChange={(e) => patch('salMax', e.target.value)}
                    className={`pl-14 h-11 ${changedInputClass(changed('salMin') || changed('salMax'))}`}
                    placeholder="Max"
                  />
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                <span>
                  Live midpoint:{' '}
                  <strong className="text-slate-900 font-semibold">
                    USD {Math.round(((parseFloat(form.salMin) || 0) + (parseFloat(form.salMax) || 0)) / 2).toLocaleString()}
                  </strong>
                </span>
                <span className="text-slate-400">
                  Current: USD {Number(original.salMin || 0).toLocaleString()} – {Number(original.salMax || 0).toLocaleString()} (midpoint USD {Math.round(originalMidpoint).toLocaleString()})
                </span>
              </div>
            </TrackedField>
            <TrackedField changed={changed('benefits')} changeMessage="Changed">
              <Input
                label={
                  <span className="flex items-center gap-1.5">
                    Additional benefits <span className="text-xs text-slate-400 font-normal">Optional</span>
                  </span>
                }
                value={form.benefits}
                onChange={(e) => patch('benefits', e.target.value)}
                className={`h-11 ${changedInputClass(changed('benefits'))}`}
              />
            </TrackedField>
            {showEscrowRecalc && (
              <EscrowRecalcCard recalc={escrowRecalc} originalMidpoint={originalMidpoint} />
            )}
          </FormSectionCard>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <LockIcon size={14} className="text-slate-500" strokeWidth={2} />
              <Subheading as="h2" className="text-sm font-medium text-slate-900">One field locked for this edit</Subheading>
            </div>
            <p className="text-[13px] text-slate-600 leading-relaxed mb-3">
              The employer organisation cannot be changed in a vault edit. If you need to transfer this
              vault to a different organisation, contact VORA support. All other specification fields are
              editable above.
            </p>
            <div className="max-w-md">
              <label className="block text-sm font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                <span>Employer organisation</span>
                <LockIcon size={12} className="text-slate-400" />
              </label>
              <input
                type="text"
                disabled
                value="Acme Global Inc."
                className="w-full h-11 px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-100/70 text-slate-500 cursor-not-allowed select-none"
              />
            </div>
          </div>
        </div>
      </ScrollArea>

      <PageActionBar
        hint={
          <span className="text-slate-600 text-[13px]">
            Changes enter a <strong className="text-blue-600 font-semibold">48-hour review window</strong> before taking effect.
          </span>
        }
      >
        <Button
          variant="outline"
          fullWidth={false}
          size="md"
          pill={false}
          className="h-11 border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50"
          onClick={() => navigate(vaultDashboardHref)}
        >
          Discard changes
        </Button>
        <Button
          fullWidth={false}
          size="md"
          pill={false}
          disabled={isAtEditLimit || !hasChanges || editVaultMutation.isPending}
          isLoading={editVaultMutation.isPending}
          loadingLabel="Submitting..."
          className="h-11 bg-[#0047CC] hover:bg-[#003cb0] text-white font-medium rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => {
            if (isAtEditLimit) {
              toast.error('Maximum of 3 vault edits allowed.');
              return;
            }
            setConfirmOpen(true);
          }}
        >
          {isAtEditLimit ? 'Edit limit reached' : 'Submit edit for review'}
        </Button>
      </PageActionBar>

      <ModalDialog
        open={confirmOpen}
        title="Submit specification edit?"
        subtitle="This edit will enter a 48-hour review window before the updated spec replaces the current one."
        onClose={() => setConfirmOpen(false)}
        maxWidth="max-w-[540px]"
        footer={
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <Button
              variant="outline"
              fullWidth
              size="md"
              pill={false}
              disabled={editVaultMutation.isPending}
              className="h-11 font-medium rounded-xl text-sm"
              onClick={() => setConfirmOpen(false)}
            >
              Go back and review
            </Button>
            <Button
              variant="primary"
              fullWidth
              size="md"
              pill={false}
              isLoading={editVaultMutation.isPending}
              loadingLabel="Submitting..."
              disabled={isAtEditLimit || editVaultMutation.isPending}
              className="h-11 bg-[#0047CC] hover:bg-[#003cb0] text-white font-medium rounded-xl text-sm px-3 whitespace-normal sm:whitespace-nowrap text-center disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleSubmit}
            >
              Submit edit and enter 48hr review
            </Button>
          </div>
        }
      >
        <div className="space-y-3.5">
          <ChangeSummaryList changes={summaryChanges} />
          <AlertBanner variant="info">
            <strong>48-hour review lock:</strong> During this window, VORA reviews the changes. No further
            edits can be made. Silent matching continues against the previous spec until confirmed.
          </AlertBanner>
          {showEscrowRecalc && (
            <AlertBanner variant="info">
              <strong>Escrow top-up required:</strong> The salary or position change alters required escrow.
              Any top-up will be charged to your payment method on file within 24 hours of confirmation.
            </AlertBanner>
          )}
        </div>
      </ModalDialog>
    </div>
  );
};

export default EditVaultRole;
