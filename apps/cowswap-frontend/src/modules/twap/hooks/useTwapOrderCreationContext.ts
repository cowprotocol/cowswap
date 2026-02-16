import { useMemo } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { CURRENT_BLOCK_FACTORY_ADDRESS } from 'modules/advancedOrders'
import {
  ComposableCowContractData,
  useComposableCowContractData,
} from 'modules/advancedOrders/hooks/useComposableCowContract'
import { useNeedsZeroApproval } from 'modules/zeroApproval'

import { useNeedsApproval } from 'common/hooks/useNeedsApproval'

export interface TwapOrderCreationContext {
  composableCowContract: ComposableCowContractData
  needsApproval: boolean
  needsZeroApproval: boolean
  spender: string
  currentBlockFactoryAddress: string
  chainId: SupportedChainId
}

export function useTwapOrderCreationContext(
  inputAmount: Nullish<CurrencyAmount<Token>>,
): TwapOrderCreationContext | null {
  const { chainId: composableCowChainId, ...composableCowContract } = useComposableCowContractData()
  const needsApproval = useNeedsApproval(inputAmount)
  const spender = useTradeSpenderAddress()
  const needsZeroApproval = useNeedsZeroApproval(inputAmount?.currency.address, spender, inputAmount)
  const currentBlockFactoryAddress = composableCowChainId ? CURRENT_BLOCK_FACTORY_ADDRESS[composableCowChainId] : null

  return useMemo(() => {
    if (
      // check for missing dependencies
      !composableCowContract ||
      !spender ||
      !currentBlockFactoryAddress
    )
      return null

    return {
      composableCowContract,
      needsApproval,
      needsZeroApproval,
      spender,
      currentBlockFactoryAddress,
      chainId: composableCowChainId,
    }
  }, [
    composableCowContract,
    spender,
    currentBlockFactoryAddress,
    needsApproval,
    needsZeroApproval,
    composableCowChainId,
  ])
}
