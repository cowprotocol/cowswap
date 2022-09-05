import { useMemo } from 'react'
import { BigNumber } from 'bignumber.js'
import { getDiscountFromBalance } from 'components/CowSubsidyModal/utils'
import { useCombinedBalance } from 'state/cowToken/hooks'
import { COW_SUBSIDY_DATA } from 'components/CowSubsidyModal/constants'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

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

  return useMemo(() => {
    if (!balance || balance?.equalTo('0')) return ZERO_BALANCE_SUBSIDY

    const balanceBn = new BigNumber(balance.quotient.toString())

    return { subsidy: getDiscountFromBalance(balanceBn), balance }
  }, [balance])
}
