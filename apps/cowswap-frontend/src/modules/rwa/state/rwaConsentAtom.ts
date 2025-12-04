import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiMergerStorage } from '@cowprotocol/core'

import { RwaConsentKey, RwaConsentRecord, getRwaConsentStorageKey } from '../types/rwaConsent'

const DEFAULT_CONSENT: RwaConsentRecord = {
  confirmed: false,
  geoMode: 'UNKNOWN',
  confirmedAt: 0,
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createRwaConsentAtom(key: RwaConsentKey) {
  const storageKey = getRwaConsentStorageKey(key)
  return atomWithStorage<RwaConsentRecord>(storageKey, DEFAULT_CONSENT, getJotaiMergerStorage())
}

const rwaConsentAtomsMap = new Map<string, ReturnType<typeof createRwaConsentAtom>>()

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getRwaConsentAtom(key: RwaConsentKey) {
  const storageKey = getRwaConsentStorageKey(key)
  
  if (!rwaConsentAtomsMap.has(storageKey)) {
    rwaConsentAtomsMap.set(storageKey, createRwaConsentAtom(key))
  }
  
  return rwaConsentAtomsMap.get(storageKey)!
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createRwaConsentStatusAtom(key: RwaConsentKey) {
  const consentAtom = getRwaConsentAtom(key)
  
  return atom((get) => {
    const consent = get(consentAtom)
    return consent.confirmed ? 'valid' as const : 'none' as const
  })
}

