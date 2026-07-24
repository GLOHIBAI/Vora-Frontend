import type { AssessmentItemType } from '../../../../services/queries/assessments/types';
import { normalizeAssessmentItemType } from '../../../../utils/assessmentItems';
import type { ItemComponent } from '../shared/types';
import LikertItem from './LikertItem';
import ForcedChoiceItem from './ForcedChoiceItem';
import RankItem from './RankItem';
import ValuesAbPairsItem from './ValuesAbPairsItem';
import ValuesTradeoffItem from './ValuesTradeoffItem';
import SingleSelectItem from './SingleSelectItem';
import SjtMostLeastItem from './SjtMostLeastItem';
import MultiSelectItem from './MultiSelectItem';
import AdaptiveMcqItem from './AdaptiveMcqItem';
import CodeItem from './CodeItem';
import ClozeItem from './ClozeItem';
import CatItem from './CatItem';
import MatchItem from './MatchItem';
import HotspotItem from './HotspotItem';
import HighlightItem from './HighlightItem';
import CompareItem from './CompareItem';
import ProbeItem from './ProbeItem';
import WorkSampleItem from './WorkSampleItem';
import NumericScaleItem from './NumericScaleItem';

/**
 * Registry mapping API item types → reusable UI components.
 * Shared across Stage 1, 2, and 3 assessment gates.
 * Covers all 53 Stage 2 item types per contract specification.
 */
export const ASSESSMENT_ITEM_COMPONENTS: Partial<Record<string, ItemComponent>> = {
  // Family 1 & 2: Single Select / Single Select + Reason
  sb: SingleSelectItem,
  jb: SingleSelectItem,
  allocate: SingleSelectItem,
  mcq: SingleSelectItem,
  sjt_single_best: SingleSelectItem,
  data: SingleSelectItem,
  dashboard: SingleSelectItem,
  chartread: SingleSelectItem,
  abtest: SingleSelectItem,
  diagnose: SingleSelectItem,
  architect: SingleSelectItem,
  liveplan: SingleSelectItem,
  liveui: SingleSelectItem,
  livemedia: SingleSelectItem,
  liveadapt: SingleSelectItem,
  livecrisis: SingleSelectItem,
  liveedit: SingleSelectItem,
  livepost: SingleSelectItem,
  risktriage: SingleSelectItem,
  orchestrate: SingleSelectItem,
  factcheck: SingleSelectItem,
  proofread: SingleSelectItem,
  querybuild: SingleSelectItem,
  metric: SingleSelectItem,
  threshold: SingleSelectItem,
  visual: SingleSelectItem,
  visualrank: RankItem,
  visualspot: HotspotItem,
  coverage: SingleSelectItem,
  dataquality: SingleSelectItem,
  editbay: SingleSelectItem,
  errorbudget: SingleSelectItem,
  grade: SingleSelectItem,
  leveledit: SingleSelectItem,
  audiomix: SingleSelectItem,
  palette: SingleSelectItem,
  position: SingleSelectItem,
  shotlist: SingleSelectItem,
  systemcheck: SingleSelectItem,
  nextq: SingleSelectItem,

  // Family 3: Compare A/B
  compare: CompareItem,

  // Family 4: Multi-select
  ms: MultiSelectItem,
  sjt_multi_select: MultiSelectItem,

  // Family 5: Rank
  rank: RankItem,
  drag_rank: RankItem,
  sjt_rank_all: RankItem,

  // Family 6: Match
  match: MatchItem,

  // Family 7: Cloze
  cloze: ClozeItem,

  // Family 8: Categorize
  cat: CatItem,

  // Family 9: Free text Probe
  probe: ProbeItem,

  // Family 10: Work sample
  work_sample: WorkSampleItem,

  // Family 11: Numeric & Scale
  numeric: NumericScaleItem,
  scale: NumericScaleItem,

  // Family 12: Code & Livecode
  code: CodeItem,
  livecode: CodeItem,

  // SJT / Values
  ml: SjtMostLeastItem,
  sjt_most_least: SjtMostLeastItem,
  hotspot: HotspotItem,
  highlight: HighlightItem,
  likert_scale: LikertItem,
  forced_choice: ForcedChoiceItem,
  values_ab_pairs: ValuesAbPairsItem,
  values_tradeoff: ValuesTradeoffItem,
  sjt_values_tradeoff: ValuesTradeoffItem,
  adaptive_mcq: AdaptiveMcqItem,
};

export const resolveAssessmentItemComponent = (
  type: AssessmentItemType | string,
): ItemComponent | null => {
  const normalized = normalizeAssessmentItemType(String(type));
  return (ASSESSMENT_ITEM_COMPONENTS[normalized] as ItemComponent) ?? (ASSESSMENT_ITEM_COMPONENTS[String(type)] as ItemComponent) ?? SingleSelectItem;
};
