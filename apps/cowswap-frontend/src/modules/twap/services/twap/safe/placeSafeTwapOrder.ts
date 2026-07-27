import { encodeFunctionData, erc20Abi, maxUint256 } from 'viem'

import type { SendBatchTxCallback } from '@cowprotocol/wallet'
import type { MetaTransactionData } from '@safe-global/types-kit'

import { ExtensibleFallbackContext } from '../../../hooks/useExtensibleFallbackContext'
import { TwapOrderCreationContext } from '../../../hooks/useTwapOrderCreationContext'
import { ConditionalOrderParams, TWAPOrder } from '../../../types'
import { extensibleFallbackSetupTxs } from '../../extensibleFallbackSetupTxs'
import { getCreateTwapOrderCalldata } from '../../getTwapCreateCalldata'

export interface GetSafeTwapOrderTxsParams {
  twapOrder: TWAPOrder
  twapOrderCreationContext: TwapOrderCreationContext
  paramsStruct: ConditionalOrderParams
  fallbackHandlerIsNotSet: boolean
  extensibleFallbackContext: ExtensibleFallbackContext
}

export interface PlaceSafeTwapOrderParams {
  twapOrder: TWAPOrder
  twapOrderCreationContext: TwapOrderCreationContext | null
  paramsStruct: ConditionalOrderParams
  fallbackHandlerIsNotSet: boolean
  extensibleFallbackContext: ExtensibleFallbackContext | null
  sendSafeTransactions: SendBatchTxCallback
}

export interface PlaceSafeTwapOrderResult {
  safeTxHash: string
  safeAddress: string
}

export async function getSafeTwapOrderTxs({
  twapOrder,
  twapOrderCreationContext,
  paramsStruct,
  fallbackHandlerIsNotSet,
  extensibleFallbackContext,
}: GetSafeTwapOrderTxsParams): Promise<MetaTransactionData[]> {
  const { composableCowContract, needsApproval, needsZeroApproval, spender, currentBlockFactoryAddress } =
    twapOrderCreationContext

  if (!currentBlockFactoryAddress) {
    throw new Error('currentBlockFactoryAddress is required to create a TWAP order')
  }

  const { sellAmount } = twapOrder
  const sellTokenAddress = sellAmount.currency.address
  const sellAmountAtoms = maxUint256

  // At the very lest, we need the create order tx:
  const txs: MetaTransactionData[] = [
    {
      to: composableCowContract.address,
      data: getCreateTwapOrderCalldata({
        composableCowContractAbi: composableCowContract.abi,
        paramsStruct,
        currentBlockFactoryAddress,
      }),
      value: '0',
      operation: 0,
    },
  ]

  if (needsApproval) {
    // If we need to approve the sell token, we need to add the approve tx first:
    const approveTx = {
      to: sellTokenAddress,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [spender as `0x${string}`, sellAmountAtoms],
      }),
      value: '0',
      operation: 0,
    }

    txs.unshift(approveTx)

    if (needsZeroApproval) {
      // Some USDT-style tokens require resetting the allowance to zero before we set a new allowance:
      const zeroApproveTx = {
        to: sellTokenAddress,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: 'approve',
          args: [spender as `0x${string}`, 0n],
        }),
        value: '0',
        operation: 0,
      }

      txs.unshift(zeroApproveTx)
    }
  }

  if (fallbackHandlerIsNotSet) {
    const fallbackSetupTxs = await extensibleFallbackSetupTxs(extensibleFallbackContext)
    txs.unshift(...fallbackSetupTxs)
  }

  return txs
}

export async function placeSafeTwapOrder({
  twapOrder,
  twapOrderCreationContext,
  paramsStruct,
  fallbackHandlerIsNotSet,
  extensibleFallbackContext,
  sendSafeTransactions,
}: PlaceSafeTwapOrderParams): Promise<PlaceSafeTwapOrderResult> {
  if (!twapOrderCreationContext || !extensibleFallbackContext)
    throw new Error('twapOrderCreationContext and safeExtensibleFallbackContext are required')

  const txs = await getSafeTwapOrderTxs({
    twapOrder,
    twapOrderCreationContext,
    paramsStruct,
    fallbackHandlerIsNotSet,
    extensibleFallbackContext,
  })

  const safeTxHash = await sendSafeTransactions(txs)

  return { safeTxHash, safeAddress: extensibleFallbackContext.safeAddress }
}
