export function shouldInvalidateLastUpdateTime(
  previousCuratedMode: boolean | undefined,
  nextCuratedMode: boolean,
): boolean {
  return previousCuratedMode === true && nextCuratedMode === false
}
