import { useMemo } from 'react'

import { ComposableCoW, Erc20 } from '@cowprotocol/abis'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { CURRENT_BLOCK_FACTORY_ADDRESS } from 'modules/advancedOrders'
import { useComposableCowContract } from 'modules/advancedOrders/hooks/useComposableCowContract'
import { useNeedsZeroApproval } from 'modules/zeroApproval'

import { useTokenContract } from 'common/hooks/useContract'
import { useNeedsApproval } from 'common/hooks/useNeedsApproval'
import { useTradeSpenderAddress } from 'common/hooks/useTradeSpenderAddress'

export interface TwapOrderCreationContext {
  composableCowContract: ComposableCoW
  needsApproval: boolean
  needsZeroApproval: boolean
  spender: string
  currentBlockFactoryAddress: string
  erc20Contract: Erc20
  chainId: SupportedChainId
}

export function useTwapOrderCreationContext(
  inputAmount: Nullish<CurrencyAmount<Token>>,
): TwapOrderCreationContext | null {
  const { contract: composableCowContract, chainId: composableCowChainId } = useComposableCowContract()
  const needsApproval = useNeedsApproval(inputAmount)
  const { contract: erc20Contract, chainId: erc20ChainId } = useTokenContract(inputAmount?.currency.address)
  const spender = useTradeSpenderAddress()
  const needsZeroApproval = useNeedsZeroApproval(erc20Contract, spender, inputAmount)
  const currentBlockFactoryAddress = composableCowChainId ? CURRENT_BLOCK_FACTORY_ADDRESS[composableCowChainId] : null

  return useMemo(() => {
    if (
      // check for missing dependencies
      !composableCowContract ||
      !erc20Contract ||
      !spender ||
      !currentBlockFactoryAddress ||
      // Ensure token and composable cow contracts are on the same chain
      composableCowChainId !== erc20ChainId
    )
      return null

    return {
      composableCowContract,
      erc20Contract,
      needsApproval,
      needsZeroApproval,
      spender,
      currentBlockFactoryAddress,
      chainId: composableCowChainId,
    }
  }, [
    composableCowContract,
    erc20Contract,
    spender,
    currentBlockFactoryAddress,
    needsApproval,
    needsZeroApproval,
    composableCowChainId,
    erc20ChainId,
  ])
}
