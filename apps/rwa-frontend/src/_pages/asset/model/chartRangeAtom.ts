import { atomWithStorage } from 'jotai/utils'

import type { RwaChartRange } from '@/entities/asset'

export const chartRangeAtom = atomWithStorage<RwaChartRange>('rwaChartRange:v1', '1D')
