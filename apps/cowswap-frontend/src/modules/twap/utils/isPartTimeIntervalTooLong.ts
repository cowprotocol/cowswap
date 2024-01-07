import { MAX_PART_TIME } from '../const'

export function isPartTimeIntervalTooLong(partTime: number | undefined): boolean {
  return partTime !== undefined && partTime > MAX_PART_TIME
}
