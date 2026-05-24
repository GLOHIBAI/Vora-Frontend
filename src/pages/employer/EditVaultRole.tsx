import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
import { ChevronLeftIcon, LockIcon } from '../../components/common/Icons';
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

const COMP_TYPE_OPTIONS = [
  { label: 'Annual salary', value: 'Annual salary' },
  { label: 'Monthly salary', value: 'Monthly salary' },
  { label: 'Daily rate (annualised)', value: 'Daily rate (annualised)' },
  { label: 'Annual stipend / fellowship', value: 'Annual stipend / fellowship' },
];

const EditVaultRole: React.FC = () => {
  const navigate = useNavigate();
  const { id: jobId } = useParams();
  const original = DEFAULT_VAULT_EDIT_ORIGINAL;
  const [form, setForm] = useState<VaultEditOriginal>({ ...original });
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const escrowRecalc = useMemo(
    () =>
      calcEscrowRecalc(
        parseFloat(form.salMin) || 0,
        parseFloat(form.salMax) || 0,
        parseInt(form.positions, 10) || 1,
        VAULT_ORIGINAL_ESCROW
      ),
    [form.salMin, form.salMax, form.positions]
  );

  const summaryChanges = useMemo((): VaultEditChange[] => {
    const list: VaultEditChange[] = [];
    const add = (field: string, key: keyof VaultEditOriginal) => {
      if (changed(key)) {
        list.push({ field, oldValue: original[key], newValue: form[key] });
      }
    };
    add('Role title', 'roleTitle');
    if (changed('salMin') || changed('salMax')) {
      list.push({
        field: 'Salary range',
        oldValue: `USD ${Number(original.salMin) / 1000}k - ${Number(original.salMax) / 1000}k`,
        newValue: `USD ${Number(form.salMin) / 1000}k - ${Number(form.salMax) / 1000}k`,
      });
    }
    return list;
  }, [form, original]);

  const hasChanges =
    detailsChanged || respChanged || expChanged || teamChanged || compChanged;

  const vaultDashboardHref = jobId ? `/jobs/${jobId}` : '/jobs?tab=Scheduled';

  const handleSubmit = () => {
    setConfirmOpen(false);
    toast.success('Edit submitted for 48-hour review');
    navigate('/jobs?tab=Scheduled');
  };

  return (
    <div className="-mx-4 lg:-mx-8 -mt-6 lg:-mt-10 flex flex-col min-h-[calc(100vh-80px)] bg-[#F7F7F7]">
      <div className="px-6 lg:px-8 py-4 bg-white border-b border-[#E6E6E6] flex flex-wrap items-center justify-between gap-3">
        <Link
          to={vaultDashboardHref}
          className="flex items-center gap-1.5 text-sm font-bold text-[#4A4A4A] hover:text-[#0047CC] transition-colors"
        >
          <ChevronLeftIcon size={16} strokeWidth={2.5} />
          Vault dashboard
        </Link>
        <EditAllowanceMeter used={VAULT_EDIT_ALLOWANCE.used} total={VAULT_EDIT_ALLOWANCE.total} />
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="px-6 lg:px-10 py-8 max-w-4xl">
          <AlertBanner className="mb-5">
            <strong>You are editing a vaulted role specification.</strong> Every change you save here
            enters a 48-hour review window before taking effect. During that window, silent matching
            continues against the previous spec. Pre-qualified candidates built up so far remain valid.
            If you change the salary band, the escrow amount recalculates and a top-up or partial refund
            fires automatically. This counts as 1 of your 3 permitted specification edits.
          </AlertBanner>

          <FormSectionCard title="Role details" changed={detailsChanged}>
            <TrackedField
              changed={changed('roleType')}
              changeMessage="Changed — matching will recalibrate after 48hr review"
            >
              <Select
                label="Role type"
                groups={ROLE_TYPE_GROUPS}
                value={form.roleType}
                onChange={(e) => patch('roleType', e.target.value)}
                className={changedInputClass(changed('roleType'))}
              />
            </TrackedField>
            <TrackedField
              changed={changed('roleTitle')}
              changeMessage={`Changed from "${original.roleTitle}"`}
            >
              <Input
                label="Role title"
                value={form.roleTitle}
                onChange={(e) => patch('roleTitle', e.target.value)}
                className={changedInputClass(changed('roleTitle'))}
              />
            </TrackedField>
            <TrackedField changed={changed('location')} changeMessage="Changed">
              <Input
                label="Work location"
                value={form.location}
                onChange={(e) => patch('location', e.target.value)}
                className={changedInputClass(changed('location'))}
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
              changeMessage="Changed — escrow will recalculate"
            >
              <Input
                label="Available positions"
                type="number"
                value={form.positions}
                onChange={(e) => patch('positions', e.target.value)}
                className={`max-w-[180px] ${changedInputClass(changed('positions'))}`}
              />
            </TrackedField>
            <TrackedField
              changed={changed('goLiveDate')}
              changeMessage="Changed — silent matching criteria updates after 48hr review"
            >
              <Input
                label="Go-live date"
                type="date"
                value={form.goLiveDate}
                onChange={(e) => patch('goLiveDate', e.target.value)}
                className={`max-w-[220px] ${changedInputClass(changed('goLiveDate'))}`}
              />
              <p className="text-xs text-[#808080] mt-1 leading-relaxed">
                Extending your go-live date is allowed. Bringing it closer may require VORA approval if
                the window is under 30 days.
              </p>
            </TrackedField>
            <TrackedField changed={changed('startDate')} changeMessage="Changed">
              <Input
                label={
                  <span>
                    Start date <span className="text-[11px] text-[#808080] font-normal italic">(optional)</span>
                  </span>
                }
                type="date"
                value={form.startDate}
                onChange={(e) => patch('startDate', e.target.value)}
                className={`max-w-[220px] ${changedInputClass(changed('startDate'))}`}
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
              changeMessage="Changed — matching engine will recalibrate after 48hr review"
            >
              <Textarea
                label="Core responsibilities"
                value={form.responsibilities}
                onChange={(e) => patch('responsibilities', e.target.value)}
                className={changedInputClass(changed('responsibilities'))}
                rows={5}
              />
            </TrackedField>
            <TrackedField changed={changed('skills')} changeMessage="Changed — matching will recalibrate">
              <Input
                label="Technical skills required"
                value={form.skills}
                onChange={(e) => patch('skills', e.target.value)}
                className={changedInputClass(changed('skills'))}
                placeholder="Comma-separated skills"
              />
              <p className="text-xs text-[#808080] mt-1">
                Edit as comma-separated values. Changes recalibrate candidate skill-match scoring after
                48hr review.
              </p>
            </TrackedField>
            <TrackedField changed={changed('tools')} changeMessage="Changed">
              <Input
                label="Tools / software required"
                value={form.tools}
                onChange={(e) => patch('tools', e.target.value)}
                className={changedInputClass(changed('tools'))}
              />
            </TrackedField>
            <TrackedField changed={changed('languages')} changeMessage="Changed">
              <Input
                label="Language requirements"
                value={form.languages}
                onChange={(e) => patch('languages', e.target.value)}
                className={changedInputClass(changed('languages'))}
              />
            </TrackedField>
            <TrackedField changed={changed('preAssessment')} changeMessage="Changed">
              <Input
                label={
                  <span>
                    Pre-assessment submission required{' '}
                    <span className="text-[11px] text-[#808080] font-normal italic">(optional)</span>
                  </span>
                }
                value={form.preAssessment}
                onChange={(e) => patch('preAssessment', e.target.value)}
                className={changedInputClass(changed('preAssessment'))}
              />
            </TrackedField>
          </FormSectionCard>

          <FormSectionCard title="Experience & background" changed={expChanged}>
            <TrackedField
              changed={changed('experienceYears')}
              changeMessage="Changed — matching re-scores affected candidates after review"
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
              changeMessage="Changed — geopolitical eligibility will be re-run"
            >
              <Select
                label="International candidate policy"
                options={INT_POLICY_ELIGIBILITY_OPTIONS}
                value={form.intPolicy}
                onChange={(e) => patch('intPolicy', e.target.value)}
                className={changedInputClass(changed('intPolicy'))}
              />
              <p className="text-xs text-[#808080] mt-1">
                Changing this may affect the eligible candidate pool — VORA updates geopolitical
                eligibility after the 48hr review window.
              </p>
            </TrackedField>
            <TrackedField changed={changed('preferredProfile')} changeMessage="Changed">
              <Textarea
                label={
                  <span>
                    Preferred candidate profile{' '}
                    <span className="text-[11px] text-[#808080] font-normal italic">(optional)</span>
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
              <Input
                label="Preferred working style"
                value={form.workingStyle}
                onChange={(e) => patch('workingStyle', e.target.value)}
                className={changedInputClass(changed('workingStyle'))}
              />
            </TrackedField>
            <TrackedField changed={changed('workCulture')} changeMessage="Changed">
              <Input
                label="Work environment / culture"
                value={form.workCulture}
                onChange={(e) => patch('workCulture', e.target.value)}
                className={changedInputClass(changed('workCulture'))}
              />
            </TrackedField>
            <TrackedField changed={changed('personalityTraits')} changeMessage="Changed">
              <Input
                label="Personality traits sought"
                value={form.personalityTraits}
                onChange={(e) => patch('personalityTraits', e.target.value)}
                className={changedInputClass(changed('personalityTraits'))}
              />
            </TrackedField>
            <TrackedField changed={changed('teamNotes')} changeMessage="Changed">
              <Textarea
                label={
                  <span>
                    Additional notes on team / environment{' '}
                    <span className="text-[11px] text-[#808080] font-normal italic">(optional)</span>
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
            changedLabel={showEscrowRecalc ? 'Changed — escrow recalculation triggered' : 'Changed'}
          >
            <TrackedField
              changed={changed('compType')}
              changeMessage="Changed — escrow will be fully recalculated"
            >
              <Select
                label="Compensation structure type"
                options={COMP_TYPE_OPTIONS}
                value={form.compType}
                onChange={(e) => patch('compType', e.target.value)}
                className={changedInputClass(changed('compType'))}
              />
              <p className="text-xs text-[#808080] mt-1">
                Changing compensation structure type triggers a full escrow recalculation. Your existing
                escrow will be adjusted within 24 hours of this edit being confirmed.
              </p>
            </TrackedField>
            <TrackedField
              changed={changed('salMin') || changed('salMax')}
              changeMessage="Salary band changed — escrow adjustment will be calculated"
            >
              <p className="text-sm font-bold text-[#1A1A1A] mb-2">
                Salary range{' '}
                <span className="text-[11px] text-[#808080] font-normal">
                  (current: USD 60,000 to 80,000 — midpoint USD 70,000)
                </span>
              </p>
              <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center max-w-md">
                <Input
                  label=""
                  type="number"
                  value={form.salMin}
                  onChange={(e) => patch('salMin', e.target.value)}
                  className={changedInputClass(changed('salMin') || changed('salMax'))}
                />
                <span className="text-sm font-bold text-[#808080] pt-6">to</span>
                <Input
                  label=""
                  type="number"
                  value={form.salMax}
                  onChange={(e) => patch('salMax', e.target.value)}
                  className={changedInputClass(changed('salMin') || changed('salMax'))}
                />
              </div>
            </TrackedField>
            <TrackedField changed={changed('benefits')} changeMessage="Changed">
              <Input
                label={
                  <span>
                    Additional benefits{' '}
                    <span className="text-[11px] text-[#808080] font-normal italic">(optional)</span>
                  </span>
                }
                value={form.benefits}
                onChange={(e) => patch('benefits', e.target.value)}
                className={changedInputClass(changed('benefits'))}
              />
            </TrackedField>
            {showEscrowRecalc && <EscrowRecalcCard recalc={escrowRecalc} />}
          </FormSectionCard>

          <div className="bg-white border border-[#E6E6E6] rounded-xl px-6 py-5 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <LockIcon size={13} className="text-[#DC2626]" strokeWidth={2} />
              <Subheading as="h2" className="text-sm">One field locked for this edit</Subheading>
            </div>
            <p className="text-[13px] text-[#808080] leading-relaxed mb-3">
              The employer organisation cannot be changed in a vault edit. If you need to transfer this
              vault to a different organisation, contact VORA support. All other specification fields are
              editable above.
            </p>
            <span className="inline-block bg-[#F7F7F7] rounded-md px-2.5 py-2 text-xs text-[#808080]">
              Employer organisation
            </span>
          </div>
        </div>
      </ScrollArea>

      <PageActionBar
        hint={
          <>
            Any changes submitted here enter a <strong>48-hour review window</strong> before taking effect.
            Salary band changes trigger automatic escrow recalculation.
          </>
        }
      >
        <Button
          variant="outline"
          fullWidth={false}
          size="md"
          className="border-[#E6E6E6] text-[#4A4A4A] font-bold"
          onClick={() => navigate(vaultDashboardHref)}
        >
          Discard changes
        </Button>
        <Button
          fullWidth={false}
          size="md"
          disabled={!hasChanges}
          className="bg-[#D97706] hover:bg-[#92400E] text-white font-bold disabled:opacity-45"
          onClick={() => setConfirmOpen(true)}
        >
          Submit edit for review
        </Button>
      </PageActionBar>

      <ModalDialog
        open={confirmOpen}
        title="Submit specification edit"
        subtitle="This edit will enter a 48-hour review window before the updated spec replaces the current one."
        onClose={() => setConfirmOpen(false)}
        footer={
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Button
              variant="outline"
              fullWidth
              size="md"
              className="font-bold"
              onClick={() => setConfirmOpen(false)}
            >
              Go back and review
            </Button>
            <Button
              fullWidth
              size="md"
              className="bg-[#D97706] hover:bg-[#92400E] text-white font-bold"
              onClick={handleSubmit}
            >
              Submit edit and enter 48hr review
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <ChangeSummaryList changes={summaryChanges} />
          <AlertBanner>
            <strong>48-hour review:</strong> During this window, VORA reviews the changes. No further
            edits can be made. Silent matching continues against the previous spec until the edit is
            confirmed. Pre-qualified candidates built up under the old spec remain flagged. This uses edit{' '}
            {VAULT_EDIT_ALLOWANCE.used} of {VAULT_EDIT_ALLOWANCE.total}.
          </AlertBanner>
          {showEscrowRecalc && (
            <AlertBanner variant="green">
              <strong>Escrow top-up required:</strong> The salary band change increases your midpoint. A
              top-up may be charged to your payment method on file within 24 hours of this edit being
              confirmed.
            </AlertBanner>
          )}
        </div>
      </ModalDialog>
    </div>
  );
};

export default EditVaultRole;
