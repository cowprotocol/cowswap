import { useMemo } from 'react'
import { BigNumber } from 'bignumber.js'
import { JSBI } from '@uniswap/sdk'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { getDiscountFromBalance } from 'components/CowSubsidyModal/utils'
import { useVCowData } from 'state/claim/hooks'
import { useTokenBalance } from 'state/wallet/hooks'
import { useActiveWeb3React } from '.'

import { COW } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { COW_SUBSIDY_DATA } from 'components/CowSubsidyModal/constants'

const ZERO_BALANCE_SUBSIDY = { subsidy: { tier: 0, discount: COW_SUBSIDY_DATA[0][1] }, balance: undefined }

export default function useCowBalanceAndSubsidy() {
  const { account, chainId } = useActiveWeb3React()
  // vcow balance
  const { total: vCowBalance } = useVCowData()
  // Cow balanc
  const cowBalance = useTokenBalance(account || undefined, chainId ? COW[chainId] : undefined)

  const balance = useMemo(() => {
    if (vCowBalance && cowBalance) {
      const totalBalance = JSBI.add(vCowBalance.quotient, cowBalance.quotient)

      // COW and vCOW safely have the same identifying properties: decimals
      // so we make JSBI maths and create a new currency as adding vCow and Cow throws and exception
      return CurrencyAmount.fromRawAmount(COW[chainId || SupportedChainId.MAINNET], totalBalance)
    } else {
      return cowBalance || vCowBalance
    }
  }, [chainId, cowBalance, vCowBalance])

  return useMemo(() => {
    if (!balance || balance?.equalTo('0')) return ZERO_BALANCE_SUBSIDY

    const balanceBn = new BigNumber(balance.quotient.toString())

    return { subsidy: getDiscountFromBalance(balanceBn), balance }
  }, [balance])
}
