import { AnyAppDataDocVersion } from '@cowprotocol/app-data'

import { Nullish } from 'types'

import { decodeAppData } from './decodeAppData'

import { AppDataReplacedOrder } from '../types'

/**
 * Get replacedOrderUid from fullAppData, which can be JSON stringified or the instance
 *
 * Returns undefined if the fullAppData is falsy or if the metadata isn't present
 */
export function getAppDataReplacedOrderUid(fullAppData: Nullish<AnyAppDataDocVersion | string>): string | undefined {
  const decodedAppData = typeof fullAppData === 'string' ? decodeAppData(fullAppData) : fullAppData

  if (!decodedAppData || !('replacedOrder' in decodedAppData.metadata) || !decodedAppData.metadata.replacedOrder) {
    return undefined
  }

  const { uid } = decodedAppData.metadata.replacedOrder as AppDataReplacedOrder

  return uid
}
