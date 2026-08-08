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

/**
 * In memory atom holding the hooks that the current appDataInfo was built from.
 *
 * appDataInfo is rebuilt asynchronously whenever the hooks change, so there is a
 * window where appDataHooksAtom already reflects a freshly added hook but
 * appDataInfoAtom still holds a doc built without it. Tracking the hooks used to
 * build the current doc lets consumers detect (and wait out) that window before
 * placing an order. See appData/hooks.ts#useIsAppDataHooksInSync.
 */
export const appDataBuiltWithHooksAtom = atom<TypedAppDataHooks | undefined>(undefined)
