import { atomWithStorage } from 'jotai/utils'

import type { RwaChartType } from '@/entities/asset'

export const chartTypeAtom = atomWithStorage<RwaChartType>('rwaChartType:v1', 'line')
