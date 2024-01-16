import { AnyAppDataDocVersion } from '@cowprotocol/app-data'

import { Nullish } from 'types'

import { decodeAppData } from './decodeAppData'

import { AppDataHooks } from '../types'

/**
 * Get hooks from fullAppData, which can be JSON stringified or the instance
 *
 * Returns undefined if the fullAppData is falsy or if there are no hooks
 */
export function getAppDataHooks(fullAppData: Nullish<AnyAppDataDocVersion | string>): AppDataHooks | undefined {
  const decodedAppData = typeof fullAppData === 'string' ? decodeAppData(fullAppData) : fullAppData

  if (!decodedAppData || !('hooks' in decodedAppData.metadata)) return undefined

  // TODO: this requires app-data v0.9.0. Might not work for newer versions...
  return decodedAppData.metadata.hooks as AppDataHooks
}
