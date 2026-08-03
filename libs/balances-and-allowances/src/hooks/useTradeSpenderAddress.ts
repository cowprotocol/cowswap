import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS } from '@cowprotocol/common-utils'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { findSolanaSettlementStatePda } from '../const/solanaSettlement'
import { tradeSpenderAtom } from '../state/balancesAtom'

export function useTradeSpenderAddress(): string | undefined {
  const { chainId } = useWalletInfo()
  const spenderOverride = useAtomValue(tradeSpenderAtom)

  return useMemo(() => {
    if (spenderOverride) return spenderOverride
    if (!chainId) return undefined

    // Solana's SPL delegate authority is the settlement state PDA — the analogue of the EVM vault relayer.
    if (isSolanaChain(chainId)) return findSolanaSettlementStatePda().toBase58()

    return COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId]
  }, [chainId, spenderOverride])
}
