import { AnyAppDataDocVersion } from '@cowprotocol/app-data'

/**
 * Decode appData from a string to a AnyAppDataDocVersion instance
 * Keep in mind it can be a valid JSON but not necessarily a valid AppDataDoc
 *
 * Returns undefined if the given appData is not a valid JSON
 * When `throwOnError` is true, it will throw an error if the given appData is not a valid JSON
 */
export function decodeFullAppData(
  appData: string | null | undefined,
  throwOnError?: true,
): AnyAppDataDocVersion | undefined {
  if (!appData) {
    return undefined
  }

  try {
    return JSON.parse(appData)
  } catch (e) {
    if (throwOnError) {
      throw e
    }

    console.info('[decodeFullAppData] given appData is not a valid JSON', appData)
    return undefined
  }
}
