import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS } from '@cowprotocol/common-utils'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { findSolanaSettlementStatePda } from '../const/solanaSettlement'
import { tradeSpenderAtom } from '../state/balancesAtom'

let solanaSpenderAddress: string | undefined

export function useTradeSpenderAddress(): string | undefined {
  const { chainId } = useWalletInfo()
  const spenderOverride = useAtomValue(tradeSpenderAtom)

  return useMemo(() => {
    if (spenderOverride) return spenderOverride
    if (!chainId) return undefined

    // On Solana the spender is the settlement state PDA — the SPL delegate authority the sell token is approved to.
    if (isSolanaChain(chainId)) {
      solanaSpenderAddress ??= findSolanaSettlementStatePda().toBase58()

      return solanaSpenderAddress
    }

    return COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId]
  }, [chainId, spenderOverride])
}
