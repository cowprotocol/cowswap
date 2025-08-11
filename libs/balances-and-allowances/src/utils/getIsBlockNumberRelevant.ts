export function getIsBlockNumberRelevant<T = number | undefined>({
  blockNumber,
  prevBlockNumber,
}: {
  blockNumber: T
  prevBlockNumber: T
}): boolean {
  return typeof prevBlockNumber === 'number' && typeof blockNumber === 'number' ? blockNumber > prevBlockNumber : true
}
