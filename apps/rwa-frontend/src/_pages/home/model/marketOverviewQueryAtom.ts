import { atomWithQuery } from 'jotai-tanstack-query'

import { marketOverviewQueryOptions } from '@/entities/asset'

export const marketOverviewQueryAtom = atomWithQuery(() => marketOverviewQueryOptions())
