import { atomWithDefault } from 'jotai/utils'

import { limitOrdersSettingsAtom } from '../../state/limitOrdersSettingsAtom'

/**
 * Flag local to the RateInput component to determine if the USD rate mode is enabled
 * Can be overridden by the global isUsdValuesMode flag from limitOrdersSettingsAtom
 */
export const isLocalUsdRateModeAtom = atomWithDefault((get) => get(limitOrdersSettingsAtom).isUsdValuesMode)
