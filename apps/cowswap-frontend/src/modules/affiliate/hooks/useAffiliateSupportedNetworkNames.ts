import { useMemo } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'

import { useDeprecatedChains } from 'common/hooks/useDeprecatedChains'

import { AFFILIATE_SUPPORTED_CHAIN_IDS } from '../config/affiliateProgram.const'

export function useAffiliateSupportedNetworkNames(): string[] {
  const deprecatedChains = useDeprecatedChains()

  return useMemo(
    () =>
      AFFILIATE_SUPPORTED_CHAIN_IDS.filter((chainId) => !deprecatedChains.has(chainId)).map(
        (chainId) => CHAIN_INFO[chainId].label,
      ),
    [deprecatedChains],
  )
}
