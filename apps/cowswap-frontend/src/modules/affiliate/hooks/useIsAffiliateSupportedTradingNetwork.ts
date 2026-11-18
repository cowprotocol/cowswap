import { useAffiliateSupportedChainIds } from './useAffiliateSupportedChainIds'

import { isSupportedTradingNetwork } from '../lib/affiliateProgramUtils'

export function useIsAffiliateSupportedTradingNetwork(chainId: number | undefined): boolean {
  return isSupportedTradingNetwork(chainId, useAffiliateSupportedChainIds())
}
