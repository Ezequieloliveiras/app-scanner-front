export function normalizeCameraEnabled(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

export function shouldHydrateCameraPreference(loadedUserId: string, nextUserId: string, isDirty: boolean): boolean {
  return loadedUserId !== nextUserId || !isDirty;
}

export function canApplyProfileRefresh(
  mutationSeqAtStart: number,
  currentMutationSeq: number,
  mutationsInFlight: number
): boolean {
  return mutationSeqAtStart === currentMutationSeq && mutationsInFlight === 0;
}

export function isLatestProfileMutation(mutationSeq: number, currentMutationSeq: number): boolean {
  return mutationSeq === currentMutationSeq;
}
