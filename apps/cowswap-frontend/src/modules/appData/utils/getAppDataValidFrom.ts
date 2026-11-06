import { AnyAppDataDocVersion } from '@cowprotocol/cow-sdk'

import { Nullish } from 'types'

import { decodeAppData } from './decodeAppData'

/**
 * Reads optional `metadata.validFrom` from fullAppData JSON.
 * TODO: Missing in sdk-app-data schema.
 */
export function getAppDataValidFrom(fullAppData: Nullish<string>): number | undefined {
  const doc = decodeAppData(fullAppData)
  return getValidFromFromAppDataDoc(doc)
}

export function getValidFromFromAppDataDoc(doc: AnyAppDataDocVersion | undefined): number | undefined {
  if (!doc || typeof doc !== 'object' || !('metadata' in doc)) {
    return undefined
  }

  const metadata = doc.metadata
  if (!metadata || typeof metadata !== 'object' || !('validFrom' in metadata)) {
    return undefined
  }

  const validFrom = (metadata as { validFrom?: unknown }).validFrom
  return typeof validFrom === 'number' && Number.isFinite(validFrom) ? validFrom : undefined
}
