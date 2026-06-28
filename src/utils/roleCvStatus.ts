/** Normalize GET /talent/role/{roleLink}/cv/status envelope or raw payload. */
export const parseRoleCvStatusPayload = (response: unknown) => {
  const root = response as { data?: Record<string, unknown> } | Record<string, unknown> | null;
  const payload = (root && 'data' in root && root.data ? root.data : root) as Record<
    string,
    unknown
  > | null;

  const parseStatus = payload?.parseStatus as string | undefined;
  const readyForMatching = payload?.readyForMatching === true;
  const cvLinkedToRole = payload?.cvLinkedToRole !== false;

  const cvReadyForMatch =
    parseStatus === 'COMPLETED' && readyForMatching && cvLinkedToRole;

  const cvParseFailed = parseStatus === 'FAILED';
  const cvParsePending =
    !cvParseFailed &&
    !cvReadyForMatch &&
    (parseStatus === 'PENDING' ||
      parseStatus === 'PROCESSING' ||
      parseStatus === undefined ||
      !readyForMatching);

  return {
    parseStatus,
    readyForMatching,
    cvLinkedToRole,
    cvReadyForMatch,
    cvParseFailed,
    cvParsePending,
  };
};
