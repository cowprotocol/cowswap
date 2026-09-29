import { atom } from 'jotai'

import type { FeatureFlags } from '@cowprotocol/common-const'

export type FeatureFlagsStatus = 'loading' | 'ready' | 'unavailable'

export const featureFlagsAtom = atom<FeatureFlags>({})
export const featureFlagsStatusAtom = atom<FeatureFlagsStatus>('loading')
