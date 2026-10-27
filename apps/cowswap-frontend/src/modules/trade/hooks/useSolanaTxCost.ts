import { useMemo } from 'react'

import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useSolanaTradeOverhead } from 'modules/tradeFormValidation'

import { useIsSolanaSponsoredTrade } from './useIsSolanaSponsoredTrade'

export interface SolanaTxCost {
  /** Rent for the accounts the bundle creates, plus the transaction fee. */
  amount: CurrencyAmount<Currency>
  /** The funder pays `amount` instead of the owner, who then spends no SOL at all. */
  isSponsored: boolean
}

/**
 * What putting a Solana order on-chain costs, in SOL, whoever ends up paying it. Unlike the costs the
 * quote reports, it is never taken out of the trade: the owner pays it when signing, or the funder
 * does on a sponsored order.
 *
 * `null` on every other chain and while the amount is unknown.
 */
export function useSolanaTxCost(): SolanaTxCost | null {
  const { chainId } = useWalletInfo()
  const isSponsored = useIsSolanaSponsoredTrade()
  const overhead = useSolanaTradeOverhead({ ignoreSponsor: true })

  return useMemo(() => {
    if (!overhead || overhead.spent <= 0n || !isSolanaChain(chainId)) return null

    return {
      amount: CurrencyAmount.fromRawAmount(NATIVE_CURRENCIES[chainId], overhead.spent.toString()),
      isSponsored,
    }
  }, [chainId, overhead, isSponsored])
}
