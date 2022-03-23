import { useMemo } from 'react'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { BigNumber } from 'bignumber.js'
import { parseUnits } from '@ethersproject/units'

import { getDiscountFromBalance } from 'components/CowSubsidyModal/utils'
import { SupportedChainId } from 'constants/chains'
import { V_COW } from 'constants/tokens'
import { useActiveWeb3React } from '.'

// TODO: get real balance
const MOCK_BALANCE = CurrencyAmount.fromRawAmount(
  V_COW[SupportedChainId.RINKEBY],
  parseUnits('111100.97', V_COW[SupportedChainId.MAINNET].decimals).toString()
)
export default function useCowBalanceAndSubsidy() {
  const { chainId } = useActiveWeb3React()

  // TODO: vcow and cow balance from @nenadV91
  /* const vCow =  */ chainId ? V_COW[chainId] : undefined
  const balance = MOCK_BALANCE // useTotalCowBalance(account || undefined, vCow)

  return useMemo(() => {
    const balanceBn = new BigNumber(balance.quotient.toString())
    return { subsidy: getDiscountFromBalance(balanceBn), balance }
  }, [balance])
}
