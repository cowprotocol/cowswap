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
  /** The funder pays `amount`, except for whatever `ownerDeposit` names. */
  isSponsored: boolean
  /**
   * The part of `amount` the owner funds even on a sponsored order: the rent for the WSOL account a
   * native sell has to open, which is the owner's own account and returns the rent when closed.
   * Null when the sponsor covers the whole amount, and on an unsponsored order where it is all the
   * owner's anyway.
   */
  ownerDeposit: CurrencyAmount<Currency> | null
}

/**
 * What putting a Solana order on-chain costs, in SOL, whoever ends up paying it. Unlike the costs the
 * quote reports, it is never taken out of the trade: the owner pays it when signing, or the funder
 * does on a sponsored order — bar the `ownerDeposit` a sponsored order leaves with the owner.
 *
 * `null` on every other chain and while the amount is unknown.
 */
export function useSolanaTxCost(): SolanaTxCost | null {
  const { chainId } = useWalletInfo()
  const isSponsored = useIsSolanaSponsoredTrade()
  const overhead = useSolanaTradeOverhead({ ignoreSponsor: true })
  const ownerOverhead = useSolanaTradeOverhead()

  return useMemo(() => {
    if (!overhead || overhead.spent <= 0n || !isSolanaChain(chainId)) return null

    const ownerSpent = isSponsored ? (ownerOverhead?.spent ?? 0n) : 0n

    return {
      amount: CurrencyAmount.fromRawAmount(NATIVE_CURRENCIES[chainId], overhead.spent.toString()),
      isSponsored,
      ownerDeposit:
        ownerSpent > 0n ? CurrencyAmount.fromRawAmount(NATIVE_CURRENCIES[chainId], ownerSpent.toString()) : null,
    }
  }, [chainId, overhead, ownerOverhead, isSponsored])
}
