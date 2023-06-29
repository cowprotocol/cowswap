import { MINIMUM_PART_TIME } from '../const'

export function isPartTimeIntervalTooShort(partTime: number | undefined): boolean {
  return partTime !== undefined && partTime < MINIMUM_PART_TIME
}
