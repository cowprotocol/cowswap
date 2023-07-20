import { atom } from 'jotai'

import { AppDataInfo } from '../types'
import { updateFullAppData } from '../utils/fullAppData'

/**
 * Base atom that store the current appDataInfo
 */
export const appDataInfoAtom = atom<AppDataInfo | null, [AppDataInfo | null], unknown>(
  null,
  (_get, set, appDataInfo) => {
    set(appDataInfoAtom, appDataInfo)
    updateFullAppData(appDataInfo?.fullAppData ?? undefined)
  }
)
