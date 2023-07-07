import { ComposableCoW, Erc20 } from '@cowprotocol/abis'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useTokenContract } from 'legacy/hooks/useContract'

import { CURRENT_BLOCK_FACTORY_ADDRESS } from 'modules/advancedOrders'
import { useComposableCowContract } from 'modules/advancedOrders/hooks/useComposableCowContract'
import { useWalletInfo } from 'modules/wallet'

import { useNeedsApproval } from 'common/hooks/useNeedsApproval'
import { useNeedsZeroApproval } from 'common/hooks/useNeedsZeroApproval'
import { useTradeSpenderAddress } from 'common/hooks/useTradeSpenderAddress'

export interface TwapOrderCreationContext {
  composableCowContract: ComposableCoW
  needsApproval: boolean
  needsZeroApproval: boolean
  spender: string
  currentBlockFactoryAddress: string
  erc20Contract: Erc20
}

export function useTwapOrderCreationContext(
  inputAmount: Nullish<CurrencyAmount<Token>>
): TwapOrderCreationContext | null {
  const { chainId } = useWalletInfo()
  const composableCowContract = useComposableCowContract()
  const needsApproval = useNeedsApproval(inputAmount)
  const erc20Contract = useTokenContract(inputAmount?.currency.address)
  const spender = useTradeSpenderAddress()
  const needsZeroApproval = useNeedsZeroApproval(erc20Contract, spender, inputAmount)
  const currentBlockFactoryAddress = chainId ? CURRENT_BLOCK_FACTORY_ADDRESS[chainId] : null

  if (!composableCowContract || !erc20Contract || !spender || !currentBlockFactoryAddress) return null

  return { composableCowContract, erc20Contract, needsApproval, needsZeroApproval, spender, currentBlockFactoryAddress }
}
