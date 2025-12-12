import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { RwaConsentKey, RwaConsentRecord } from '../types/rwaConsent'

type RwaConsentCache = Record<string, string>

export const rwaConsentCacheAtom = atomWithStorage<RwaConsentCache>('rwaConsentCache:v1', {}, undefined, {
  unstable_getOnInit: true,
})

export const storeRwaConsentAtom = atom(null, (get, set, params: RwaConsentKey) => {
  const key = buildRwaConsentKey(params)

  const dataToCache: RwaConsentRecord = {
    acceptedAt: Date.now(),
  }

  set(rwaConsentCacheAtom, (cache) => ({ ...cache, [key]: JSON.stringify(dataToCache) }))
})

export const getRwaConsentAtom = atom(null, (get, _set, params: RwaConsentKey): RwaConsentRecord | undefined => {
  const cache = get(rwaConsentCacheAtom)
  return getConsentFromCache(cache, params)
})

export const removeRwaConsentAtom = atom(null, (get, set, params: RwaConsentKey) => {
  const key = buildRwaConsentKey(params)

  set(rwaConsentCacheAtom, (cache) => {
    const newCache = { ...cache }
    delete newCache[key]
    return newCache
  })
})

export function buildRwaConsentKey({ wallet, tosVersion }: RwaConsentKey): string {
  return `${wallet.toLowerCase()}-${tosVersion}`
}

export function getConsentFromCache(
  cache: RwaConsentCache,
  key: RwaConsentKey,
): RwaConsentRecord | undefined {
  const cacheKey = buildRwaConsentKey(key)
  const cachedData = cache[cacheKey]

  if (!cachedData) {
    return undefined
  }

  try {
    return JSON.parse(cachedData) as RwaConsentRecord
  } catch {
    return undefined
  }
}
