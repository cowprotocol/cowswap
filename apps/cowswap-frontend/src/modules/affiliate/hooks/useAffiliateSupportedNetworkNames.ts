import { useMemo } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'

import { useAffiliateSupportedChainIds } from './useAffiliateSupportedChainIds'

export function useAffiliateSupportedNetworkNames(): string[] {
  const supportedChainIds = useAffiliateSupportedChainIds()

  return useMemo(() => supportedChainIds.map((chainId) => CHAIN_INFO[chainId].label), [supportedChainIds])
}
