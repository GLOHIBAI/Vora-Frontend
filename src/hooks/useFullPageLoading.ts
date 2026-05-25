/**
 * Full-page spinner when any request is in flight, except when a button already shows loading.
 */
export function useFullPageLoading(
  isFetching: boolean,
  buttonLoading: boolean | boolean[] = false,
): boolean {
  const hasButtonLoading = Array.isArray(buttonLoading)
    ? buttonLoading.some(Boolean)
    : buttonLoading;
  return isFetching && !hasButtonLoading;
}
