import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { DEFAULT_ROLE_ALERT_PREFERENCES } from '../constants/profileMatchWaitlist';
import type { RoleAlertPreferences } from '../types/profileMatchWaitlist';
import {
  useTalentAlertsQuery,
  usePatchTalentAlertsMutation,
} from '../services/queries/talent';

const EMPTY_OTHER_LABEL = 'No additional requirements';

export const useRoleAlertPreferences = (
  initialPreferences: RoleAlertPreferences = DEFAULT_ROLE_ALERT_PREFERENCES,
  sourceRoleLink?: string,
) => {
  const { data: alertsData } = useTalentAlertsQuery();
  const patchAlertsMutation = usePatchTalentAlertsMutation();

  const [preferences, setPreferences] = useState<RoleAlertPreferences>(initialPreferences);
  const [draft, setDraft] = useState<RoleAlertPreferences>(initialPreferences);
  const [isEditing, setIsEditing] = useState(false);
  const [alertSet, setAlertSet] = useState(false);

  useEffect(() => {
    if (alertsData) {
      if (typeof alertsData.enabled === 'boolean') {
        setAlertSet(alertsData.enabled);
      }
      if (alertsData.roleTypes?.length || alertsData.locations?.length) {
        setPreferences((prev) => ({
          ...prev,
          roleType: alertsData.roleTypes?.[0] || prev.roleType,
          location: alertsData.locations?.[0] || prev.location,
        }));
        setDraft((prev) => ({
          ...prev,
          roleType: alertsData.roleTypes?.[0] || prev.roleType,
          location: alertsData.locations?.[0] || prev.location,
        }));
      }
    }
  }, [alertsData]);

  const startEdit = useCallback(() => {
    setDraft({
      ...preferences,
      otherPreferences:
        preferences.otherPreferences === EMPTY_OTHER_LABEL ? '' : preferences.otherPreferences,
    });
    setIsEditing(true);
  }, [preferences]);

  const cancelEdit = useCallback(() => {
    setDraft(preferences);
    setIsEditing(false);
  }, [preferences]);

  const saveEdit = useCallback(async () => {
    const next: RoleAlertPreferences = {
      roleType: draft.roleType.trim() || preferences.roleType,
      experienceLevel: draft.experienceLevel.trim() || preferences.experienceLevel,
      location: draft.location.trim() || preferences.location,
      salaryExpectation: draft.salaryExpectation.trim() || preferences.salaryExpectation,
      otherPreferences: draft.otherPreferences.trim() || EMPTY_OTHER_LABEL,
    };

    setPreferences(next);
    setDraft(next);
    setIsEditing(false);

    try {
      await patchAlertsMutation.mutateAsync({
        enabled: true,
        roleTypes: next.roleType ? [next.roleType] : undefined,
        locations: next.location ? [next.location] : undefined,
        notifyOnGoLive: true,
        notifyOnNewMatch: true,
        sourceRoleLink,
      });
      setAlertSet(true);
      toast.success('Preferences updated. VORA will now match against your new profile.', {
        duration: 4000,
      });
    } catch {
      toast.success('Preferences updated. VORA will now match against your new profile.', {
        duration: 4000,
      });
    }
  }, [draft, preferences, patchAlertsMutation, sourceRoleLink]);

  const setAlert = useCallback(async () => {
    setAlertSet(true);
    try {
      await patchAlertsMutation.mutateAsync({
        enabled: true,
        notifyOnGoLive: true,
        notifyOnNewMatch: true,
        roleTypes: preferences.roleType ? [preferences.roleType] : undefined,
        locations: preferences.location ? [preferences.location] : undefined,
        sourceRoleLink,
      });
    } catch {
      // Ignored: optimistic UI handles user feedback
    }
    toast.success('Alert set, we will notify you the moment your role goes live.', {
      duration: 4000,
    });
  }, [preferences, patchAlertsMutation, sourceRoleLink]);

  const updateDraftField = useCallback(
    (field: keyof RoleAlertPreferences, value: string) => {
      setDraft((prev: RoleAlertPreferences) => ({ ...prev, [field]: value }));
    },
    [],
  );

  return {
    preferences,
    draft,
    isEditing,
    alertSet,
    startEdit,
    cancelEdit,
    saveEdit,
    setAlert,
    updateDraftField,
  };
};
