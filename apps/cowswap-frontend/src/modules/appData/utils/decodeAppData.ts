import { AnyAppDataDocVersion } from '@cowprotocol/app-data'

import { Nullish } from 'types'

/**
 * Decode appData from a string to a AnyAppDataDocVersion instance
 * Keep in mind it can be a valid JSON but not necessarily a valid AppDataDoc
 *
 * Returns undefined if the given appData is not a valid JSON
 */
export function decodeAppData(appData: Nullish<string>): AnyAppDataDocVersion | undefined {
  if (!appData) {
    return undefined
  }

  try {
    // TODO: returned value can be a valid JSON but not necessarily a valid AppDataDoc
    return JSON.parse(appData)
  } catch {
    console.info(`[decodeAppData] given appData is not a valid JSON`, appData)

    return undefined
  }
}
