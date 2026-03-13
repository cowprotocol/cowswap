const TWAP_EOA_PROTOTYPE_QUERY_PARAM = 'twapEoaPrototype'

export function getIsTwapEoaPrototypeEnabled(search: string, hash?: string): boolean {
  const values = [
    new URLSearchParams(search).get(TWAP_EOA_PROTOTYPE_QUERY_PARAM),
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get(TWAP_EOA_PROTOTYPE_QUERY_PARAM)
      : null,
    new URLSearchParams(hash?.split('?')[1] || '').get(TWAP_EOA_PROTOTYPE_QUERY_PARAM),
  ]

  const value = values.find(Boolean)?.toLowerCase()

  return value === '1' || value === 'true'
}
