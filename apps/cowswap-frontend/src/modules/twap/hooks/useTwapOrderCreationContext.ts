import { useMemo } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { Nullish } from 'types'

import { CURRENT_BLOCK_FACTORY_ADDRESS } from 'modules/advancedOrders'
import { useComposableCowContractData } from 'modules/advancedOrders/hooks/useComposableCowContract'
import type { ComposableCowContractData } from 'modules/advancedOrders/hooks/useComposableCowContract'
import { useNeedsZeroApproval } from 'modules/zeroApproval'

import { useTokenContract } from 'common/hooks/useContract'
import { useNeedsApproval } from 'common/hooks/useNeedsApproval'

export interface TwapOrderCreationContext {
  composableCowContract: ComposableCowContractData
  needsApproval: boolean
  needsZeroApproval: boolean
  spender: string
  currentBlockFactoryAddress: string | null
  erc20Contract: ReturnType<typeof useTokenContract>
  chainId: SupportedChainId
}

export function useTwapOrderCreationContext(
  inputAmount: Nullish<CurrencyAmount<Token>>,
): TwapOrderCreationContext | null {
  const composableCowContract = useComposableCowContractData()
  const composableCowChainId = composableCowContract.chainId
  const needsApproval = useNeedsApproval(inputAmount)
  const erc20ContractData = useTokenContract(inputAmount?.currency.address)
  const erc20ChainId = erc20ContractData.chainId
  const spender = useTradeSpenderAddress()
  const needsZeroApproval = useNeedsZeroApproval(inputAmount?.currency, spender, inputAmount)
  const currentBlockFactoryAddress =
    composableCowChainId != null ? CURRENT_BLOCK_FACTORY_ADDRESS[composableCowChainId as SupportedChainId] : null

  return useMemo(() => {
    if (
      !composableCowContract?.address ||
      !erc20ContractData?.contract ||
      !spender ||
      !currentBlockFactoryAddress ||
      composableCowChainId !== erc20ChainId
    )
      return null

    return {
      composableCowContract,
      erc20Contract: erc20ContractData,
      needsApproval,
      needsZeroApproval,
      spender,
      currentBlockFactoryAddress,
      chainId: composableCowChainId,
    }
  }, [
    composableCowContract,
    erc20ContractData,
    spender,
    currentBlockFactoryAddress,
    needsApproval,
    needsZeroApproval,
    composableCowChainId,
    erc20ChainId,
  ])
}
