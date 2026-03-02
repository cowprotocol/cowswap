import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { COW_SUBSIDY_DATA } from 'legacy/components/CowSubsidyModal/constants'
import { getDiscountFromBalance } from 'legacy/components/CowSubsidyModal/utils'

import { useCombinedBalance } from './useCombinedBalance'

const ZERO_BALANCE_SUBSIDY = { subsidy: { tier: 0, discount: COW_SUBSIDY_DATA[0][1] }, balance: undefined }

export interface BalanceAndSubsidy {
  subsidy: {
    tier: number
    discount: number
  }
  balance?: CurrencyAmount<Token>
}

export default function useCowBalanceAndSubsidy(): BalanceAndSubsidy {
  const { balance } = useCombinedBalance()
  const { chainId } = useWalletInfo()

  return useMemo(() => {
    if (!chainId || !balance || balance?.equalTo('0')) return ZERO_BALANCE_SUBSIDY

    const balanceBigInt = BigInt(balance.quotient.toString())

    return { subsidy: getDiscountFromBalance(balanceBigInt), balance }
  }, [balance, chainId])
}
