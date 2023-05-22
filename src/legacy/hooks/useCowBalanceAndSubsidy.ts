import { useMemo } from 'react'
import { BigNumber } from 'bignumber.js'
import { getDiscountFromBalance } from 'legacy/components/CowSubsidyModal/utils'
import { useCombinedBalance } from 'legacy/state/cowToken/hooks'
import { COW_SUBSIDY_DATA } from 'legacy/components/CowSubsidyModal/constants'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { isSupportedChain } from 'legacy/utils/supportedChainId'
import { useWalletInfo } from 'modules/wallet'

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
    if (!isSupportedChain(chainId) || !balance || balance?.equalTo('0')) return ZERO_BALANCE_SUBSIDY

    const balanceBn = new BigNumber(balance.quotient.toString())

    return { subsidy: getDiscountFromBalance(balanceBn), balance }
  }, [balance, chainId])
}
