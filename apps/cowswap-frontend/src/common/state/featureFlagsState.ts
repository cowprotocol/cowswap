import { atom } from 'jotai'

import type { FeatureFlags } from '@cowprotocol/common-const'

export const featureFlagsAtom = atom<FeatureFlags>({})
export const featureFlagsHydratedAtom = atom<boolean>(false)
