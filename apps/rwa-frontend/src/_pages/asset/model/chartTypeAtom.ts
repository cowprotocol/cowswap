import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { RWA_CHART_TYPES, type RwaChartType } from '@/entities/asset'

const DEFAULT_CHART_TYPE: RwaChartType = 'line'

const storedChartTypeAtom = atomWithStorage<unknown>('rwaChartType:v1', DEFAULT_CHART_TYPE)

export const chartTypeAtom = atom(
  (get): RwaChartType => {
    const stored = get(storedChartTypeAtom)

    return RWA_CHART_TYPES.find((chartType) => chartType === stored) ?? DEFAULT_CHART_TYPE
  },
  (_get, set, chartType: RwaChartType) => set(storedChartTypeAtom, chartType),
)
