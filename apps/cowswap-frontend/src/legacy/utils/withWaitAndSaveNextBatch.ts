export function withWaitAndSaveNextBatch<T extends { waitAndSaveNextBatch?: number }>(
  order: T,
  waitAndSaveNextBatch: number | undefined,
): T {
  if (typeof waitAndSaveNextBatch !== 'number' || !Number.isFinite(waitAndSaveNextBatch)) {
    return order
  }

  return { ...order, waitAndSaveNextBatch }
}
