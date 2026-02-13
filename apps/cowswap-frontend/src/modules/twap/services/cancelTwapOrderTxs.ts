import { USDC_LENS, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { isZkSyncChain, SupportedChainId } from '@cowprotocol/cow-sdk'
import { ComposableCoW } from '@cowprotocol/cowswap-abis'
import { ContractsOrder } from '@cowprotocol/sdk-contracts-ts'
import type { MetaTransactionData } from '@safe-global/types-kit'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { estimateGas } from '@wagmi/core'
import { encodeFunctionData } from 'viem'

import { SettlementContractData } from 'common/hooks/useContract'
import { toKeccak256 } from 'common/utils/toKeccak256'

import { computeOrderUid } from '../../../utils/orderUtils/computeOrderUid'
import { TWAPOrder, TwapOrderItem } from '../types'
import { buildTwapOrderParamsStruct } from '../utils/buildTwapOrderParamsStruct'
import { createPartOrderFromParent } from '../utils/buildTwapParts'
import { getConditionalOrderId } from '../utils/getConditionalOrderId'
import { twapOrderToStruct } from '../utils/twapOrderToStruct'

import type { Hex } from 'viem'
import type { Config } from 'wagmi'

export interface CancelTwapOrderContext {
  composableCowContract: ComposableCoW
  config: Config
  settlementContract: Omit<SettlementContractData, 'chainId'>
  orderId: string
  chainId: SupportedChainId
  partOrderId?: Hex
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
    data: encodeFunctionData({ abi: settlementContract.abi, functionName: 'invalidateOrder', args: [partOrderId] }),
    value: '0',
    operation: 0,
  }

  return [cancelTwapOrderTx, cancelTwapPartOrderTx]
}

// TODO: we might need a custom method for estimating gas on Linea
export async function estimateCancelTwapOrderTxs(context: CancelTwapOrderContext): Promise<bigint> {
  if (isZkSyncChain(context.chainId)) {
    // Lens is a zkSync chain, so we need to use a different estimation method
    // See the function estimateZkSyncCancelTwapOrderTxs for details
    return estimateZkSyncCancelTwapOrderTxs(context)
  }

  const { composableCowContract, config, settlementContract, orderId, partOrderId } = context
  const cancelComposableCowTxCost = (await composableCowContract.estimateGas.remove(orderId)).toBigInt()

  if (!partOrderId) return cancelComposableCowTxCost

  const cancelPartOrderTx = await estimateGas(config, {
    to: settlementContract.address,
    data: encodeFunctionData({
      abi: settlementContract.abi,
      functionName: 'invalidateOrder',
      args: [partOrderId],
    }),
  })

  return cancelComposableCowTxCost + cancelPartOrderTx
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
async function estimateZkSyncCancelTwapOrderTxs(context: CancelTwapOrderContext): Promise<bigint> {
  const { composableCowContract, config, settlementContract, partOrderId: hasPartOrder, chainId } = context

  const orderId = getFakeTwapOrderId(chainId)
  const cancelComposableCowTxCost = (
    await composableCowContract.connect(FAKE_OWNER).estimateGas.remove(orderId)
  ).toBigInt()

  if (!hasPartOrder) {
    return cancelComposableCowTxCost
  }

  const partOrderId = (await getFakeTwapPartOrderId(chainId)) as Hex
  const cancelPartOrderTx = await estimateGas(config, {
    account: FAKE_OWNER,
    to: settlementContract.address,
    data: encodeFunctionData({
      abi: settlementContract.abi,
      functionName: 'invalidateOrder',
      args: [partOrderId],
    }),
  })

  return cancelComposableCowTxCost + cancelPartOrderTx
}

let APP_DATA_HASH: string | undefined

function getAppDataHash(): string {
  if (!APP_DATA_HASH) {
    APP_DATA_HASH = toKeccak256(JSON.stringify({ version: '1.6.0', appCode: 'CoW Swap', metadata: {} }))
  }
  return APP_DATA_HASH
}

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
  get appData() {
    return getAppDataHash()
  },
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
