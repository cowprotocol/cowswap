import { SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

import type { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'

const ONCHAIN_TX_TIMEOUT: Record<SupportedChainId, number> = {
  [SupportedChainId.MAINNET]: ms`30m`,
  [SupportedChainId.GNOSIS_CHAIN]: ms`15m`,
  [SupportedChainId.SEPOLIA]: ms`5m`,
}

export function getIsTxExpired(tx: EnhancedTransactionDetails, chainId: SupportedChainId): boolean {
  return Date.now() - tx.addedTime > ONCHAIN_TX_TIMEOUT[chainId]
}
