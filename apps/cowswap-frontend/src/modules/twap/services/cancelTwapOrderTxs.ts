import { ComposableCoW, GPv2Settlement } from '@cowprotocol/abis'
import { USDC_LENS, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ContractsOrder } from '@cowprotocol/sdk-contracts-ts'
import { BigNumber } from '@ethersproject/bignumber'
import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { toKeccak256 } from 'common/utils/toKeccak256'

import { computeOrderUid } from '../../../utils/orderUtils/computeOrderUid'
import { TWAPOrder, TwapOrderItem } from '../types'
import { buildTwapOrderParamsStruct } from '../utils/buildTwapOrderParamsStruct'
import { createPartOrderFromParent } from '../utils/buildTwapParts'
import { getConditionalOrderId } from '../utils/getConditionalOrderId'
import { twapOrderToStruct } from '../utils/twapOrderToStruct'

export interface CancelTwapOrderContext {
  composableCowContract: ComposableCoW
  settlementContract: GPv2Settlement
  orderId: string
  chainId: SupportedChainId
  partOrderId?: string
}

export function cancelTwapOrderTxs(context: CancelTwapOrderContext): MetaTransactionData[] {
  const { composableCowContract, settlementContract, orderId, partOrderId } = context
  const cancelTwapOrderTx = {
    to: composableCowContract.address,
    data: composableCowContract.interface.encodeFunctionData('remove', [orderId]),
    value: '0',
    operation: 0,
  }

  if (!partOrderId) return [cancelTwapOrderTx]

  const cancelTwapPartOrderTx = {
    to: settlementContract.address,
    data: settlementContract.interface.encodeFunctionData('invalidateOrder', [partOrderId]),
    value: '0',
    operation: 0,
  }

  return [cancelTwapOrderTx, cancelTwapPartOrderTx]
}

export async function estimateCancelTwapOrderTxs(context: CancelTwapOrderContext): Promise<BigNumber> {
  if (context.chainId === SupportedChainId.LENS) {
    // Lens is a zkSync chain, so we need to use a different estimation method
    // See the function estimateZkSyncCancelTwapOrderTxs for details
    return estimateZkSyncCancelTwapOrderTxs(context)
  }

  const { composableCowContract, settlementContract, orderId, partOrderId } = context
  const cancelComposableCowTxCost = await composableCowContract.estimateGas.remove(orderId)

  if (!partOrderId) return cancelComposableCowTxCost

  const cancelPartOrderTx = await settlementContract.estimateGas.invalidateOrder(partOrderId)

  return cancelComposableCowTxCost.add(cancelPartOrderTx)
}

/**
 * Estimates the gas cost for cancelling a TWAP order on zkSync.
 *
 * Due to the fact that zkSync chains have a particular way of handling accounts, the eth_estimateGas call fails when coming from a contract.
 * For more details, see https://github.com/zkSync-Community-Hub/zksync-developers/discussions/144
 * For the inspiration for the workaround, see https://github.com/safe-global/safe-wallet-monorepo/pull/3369
 *
 * Thus, this function estimates the gas cost by simulating the transaction as if it were sent by a fake EOA address.
 */
async function estimateZkSyncCancelTwapOrderTxs(context: CancelTwapOrderContext): Promise<BigNumber> {
  const { composableCowContract, settlementContract, partOrderId: hasPartOrder, chainId } = context

  const orderId = getFakeTwapOrderId(chainId)
  const cancelComposableCowTxCost = await composableCowContract.connect(FAKE_OWNER).estimateGas.remove(orderId)

  if (!hasPartOrder) {
    return cancelComposableCowTxCost
  }

  const partOrderId = await getFakeTwapPartOrderId(chainId)
  const cancelPartOrderTx = await settlementContract.connect(FAKE_OWNER).estimateGas.invalidateOrder(partOrderId)

  return cancelComposableCowTxCost.add(cancelPartOrderTx)
}

const APP_DATA_HASH = toKeccak256(JSON.stringify({ version: '1.6.0', appCode: 'CoW Swap', metadata: {} }))

const FAKE_OWNER = '0x330d9F4906EDA1f73f668660d1946bea71f48827'

const START_TIME = Math.floor(Date.now() / 1000)

const FAKE_TWAP_ORDER: TWAPOrder = {
  sellAmount: CurrencyAmount.fromRawAmount(WRAPPED_NATIVE_CURRENCIES[SupportedChainId.LENS], 100_000_000_000),
  buyAmount: CurrencyAmount.fromRawAmount(USDC_LENS, 200_000_000_000),
  receiver: FAKE_OWNER,
  numOfParts: 2,
  startTime: START_TIME,
  timeInterval: 600,
  span: 0,
  appData: APP_DATA_HASH,
}

const FAKE_ORDER_IDS_CACHE: Partial<Record<SupportedChainId, string>> = {}

function getFakeTwapOrderId(chainId: SupportedChainId): string {
  if (FAKE_ORDER_IDS_CACHE[chainId]) {
    return FAKE_ORDER_IDS_CACHE[chainId]
  }

  const paramsStruct = buildTwapOrderParamsStruct(chainId, FAKE_TWAP_ORDER)

  FAKE_ORDER_IDS_CACHE[chainId] = getConditionalOrderId(paramsStruct)
  return FAKE_ORDER_IDS_CACHE[chainId]
}

const FAKE_PART_ORDER_IDS_CACHE: Partial<Record<SupportedChainId, string>> = {}

async function getFakeTwapPartOrderId(chainId: SupportedChainId): Promise<string> {
  if (FAKE_PART_ORDER_IDS_CACHE[chainId]) {
    return FAKE_PART_ORDER_IDS_CACHE[chainId]
  }

  const part = createPartOrderFromParent(
    {
      order: twapOrderToStruct(FAKE_TWAP_ORDER),
      safeTxParams: { executionDate: new Date().toISOString() },
    } as TwapOrderItem,
    0,
  )

  FAKE_PART_ORDER_IDS_CACHE[chainId] = await computeOrderUid(chainId, FAKE_OWNER, part as ContractsOrder)
  return FAKE_PART_ORDER_IDS_CACHE[chainId]
}
