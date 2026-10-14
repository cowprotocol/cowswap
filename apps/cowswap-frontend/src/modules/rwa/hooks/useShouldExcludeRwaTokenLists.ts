import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { getCountryAsKey } from '@cowprotocol/tokens'

import { useGeoCountry } from './useGeoCountry'

const RWA_TOKEN_LISTS_EXCLUDED_COUNTRY = 'US'

export function useShouldExcludeRwaTokenLists(): boolean {
  const { isRwaGeoblockEnabled } = useFeatureFlags()
  const country = useGeoCountry()

  if (!isRwaGeoblockEnabled || !country || isInjectedWidget()) return false

  return getCountryAsKey(country) === RWA_TOKEN_LISTS_EXCLUDED_COUNTRY
}
