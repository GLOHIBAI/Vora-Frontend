import toast from 'react-hot-toast';
import { apiClient, getApiErrorMessage } from '../services/api';
import { fetchGate2PillarItems } from '../services/queries/assessments';
import { normalizeAssessmentItems } from './assessmentItems';
import { unwrapAssessmentData } from './assessmentSession';
import type { Gate2PillarKey, ResponsesMap } from '../services/queries/assessments/types';

export interface FinalPillarSubmitOptions {
  assessmentId: string;
  pillarId: Gate2PillarKey | string;
  componentId?: string;
  responses?: ResponsesMap;
  allItems?: Array<{ id: string; title?: string; [key: string]: any }>;
  navigateToItem?: (itemId: string, itemIndex?: number) => void;
  onSuccess?: () => void;
}

/**
 * handleFinalPillarSubmit
 * Submits a Stage 2 pillar for scoring with built-in auto-recovery.
 * If backend rejects due to missing items, fetches status and auto-redirects
 * to the first unsaved question.
 */
export async function handleFinalPillarSubmit({
  assessmentId,
  pillarId,
  componentId,
  responses = {},
  allItems = [],
  navigateToItem,
  onSuccess,
}: FinalPillarSubmitOptions): Promise<boolean> {
  const compId = componentId || `g2-${pillarId}`;

  try {
    const res = await apiClient.post<any>({
      url: `/assessments/${assessmentId}/components/${compId}/submit`,
      body: { responses },
      auth: true,
      suppressErrorToast: true,
    });

    toast.success('Pillar completed successfully!');
    onSuccess?.();
    return true;
  } catch (err: any) {
    const errorMsg = getApiErrorMessage(err, '');
    const lower = errorMsg.toLowerCase();

    // Check if error is due to already submitted / completed
    if (
      lower.includes('already submitted') ||
      lower.includes('already been submitted') ||
      lower.includes('completed')
    ) {
      toast.success('Pillar already submitted.');
      onSuccess?.();
      return true;
    }

    // Auto-Recovery: fetch pillar items and status to locate unsaved questions
    try {
      const statusRes = await fetchGate2PillarItems(assessmentId, pillarId);
      const data = unwrapAssessmentData<Record<string, any>>(statusRes) ?? (statusRes as Record<string, any>);
      const rawItems = data?.items || (data?.data && typeof data.data === 'object' ? data.data.items : undefined) || allItems;
      const normalizedItems = normalizeAssessmentItems(rawItems);

      const savedResponses: Record<string, any> = data?.responses || (data?.data && typeof data.data === 'object' ? data.data.responses : {}) || responses;

      const unsavedItem = normalizedItems.find((item: any) => {
        const val = savedResponses[item.id];
        return val === undefined || val === null || val === '';
      });

      if (unsavedItem && navigateToItem) {
        const itemTitle = unsavedItem.title || unsavedItem.screenTitle || (unsavedItem.content as any)?.title || 'Question';
        toast.error(`Please complete all questions before submitting.`);
        toast(`Redirecting you to complete: ${itemTitle}`, { icon: 'ℹ️' });
        navigateToItem(unsavedItem.id);
        return false;
      }
    } catch (recoveryErr) {
      console.warn('Auto-recovery status check failed:', recoveryErr);
    }

    toast.error(errorMsg || 'Submission failed. Please check your answers and try again.');
    return false;
  }
}
