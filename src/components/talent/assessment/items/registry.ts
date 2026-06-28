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

/**
 * Registry mapping API item types → reusable UI components.
 * Shared across Stage 1, 2, and 3 assessment gates.
 */
export const ASSESSMENT_ITEM_COMPONENTS: Partial<Record<AssessmentItemType, ItemComponent>> = {
  likert_scale: LikertItem,
  forced_choice: ForcedChoiceItem,
  rank: RankItem,
  drag_rank: RankItem,
  values_ab_pairs: ValuesAbPairsItem,
  values_tradeoff: ValuesTradeoffItem,
  sjt_values_tradeoff: ValuesTradeoffItem,
  sjt_rank_all: RankItem,
  sjt_most_least: SjtMostLeastItem,
  sjt_multi_select: MultiSelectItem,
  sjt_single_best: SingleSelectItem,
  mcq: SingleSelectItem,
  adaptive_mcq: AdaptiveMcqItem,
};

export const resolveAssessmentItemComponent = (
  type: AssessmentItemType | string,
): ItemComponent | null => {
  const normalized = normalizeAssessmentItemType(String(type));
  return ASSESSMENT_ITEM_COMPONENTS[normalized] ?? null;
};
