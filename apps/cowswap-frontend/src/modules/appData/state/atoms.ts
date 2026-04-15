import { atom } from 'jotai'

import { deepEqual } from '@cowprotocol/common-utils'

import { AppDataInfo, TypedAppDataHooks } from '../types'
import { updateFullAppData } from '../utils/fullAppData'

/**
 * Base atom that store the current appDataInfo
 */
export const appDataInfoAtom = atom<AppDataInfo | null, [AppDataInfo | null], unknown>(
  null,
  (get, set, appDataInfo) => {
    const previous = get(appDataInfoAtom)

    // Do not update if both are equal to avoid unnecessary re-renders
    if (previous && appDataInfo && deepEqual(previous, appDataInfo)) {
      return
    }

    set(appDataInfoAtom, appDataInfo)
    updateFullAppData(appDataInfo?.fullAppData)
  },
)

/**
 * In memory atom for storing the current appData hooks info
 */
export const appDataHooksAtom = atom<TypedAppDataHooks | undefined>(undefined)
