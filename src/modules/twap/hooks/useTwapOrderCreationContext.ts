import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { Erc20 } from 'legacy/abis/types'
import { useTokenContract } from 'legacy/hooks/useContract'

import { useComposableCowContract } from 'modules/advancedOrders/hooks/useComposableCowContract'

import { ComposableCoW } from 'abis/types'
import { useNeedsApproval } from 'common/hooks/useNeedsApproval'
import { useTradeSpenderAddress } from 'common/hooks/useTradeSpenderAddress'

export interface TwapOrderCreationContext {
  composableCowContract: ComposableCoW
  needsApproval: boolean
  spender: string
  erc20Contract: Erc20
}

export function useTwapOrderCreationContext(
  inputAmount: Nullish<CurrencyAmount<Token>>
): TwapOrderCreationContext | null {
  const composableCowContract = useComposableCowContract()
  const needsApproval = useNeedsApproval(inputAmount)
  const erc20Contract = useTokenContract(inputAmount?.currency.address)
  const spender = useTradeSpenderAddress()

  if (!composableCowContract || !erc20Contract || !spender) return null

  return { composableCowContract, erc20Contract, needsApproval, spender }
}
