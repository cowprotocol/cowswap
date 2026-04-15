import { isZkSyncChain, SupportedChainId } from '@cowprotocol/cow-sdk'
import { ComposableCoWAbi, GPv2SettlementAbi } from '@cowprotocol/cowswap-abis'
import type { MetaTransactionData } from '@safe-global/types-kit'

import { encodeFunctionData, type Address, type PublicClient } from 'viem'

export interface CancelTwapOrderContext {
  composableCowAddress: Address
  composableCowAbi: typeof ComposableCoWAbi
  settlementAddress: Address
  settlementAbi: typeof GPv2SettlementAbi
  orderId: string
  chainId: SupportedChainId
  partOrderId?: string
  publicClient?: PublicClient
  account?: Address
}

export function cancelTwapOrderTxs(context: CancelTwapOrderContext): MetaTransactionData[] {
  const { composableCowAddress, composableCowAbi, settlementAddress, settlementAbi, orderId, partOrderId } = context
  const cancelTwapOrderTx = {
    to: composableCowAddress,
    data: encodeFunctionData({
      abi: composableCowAbi,
      functionName: 'remove',
      args: [orderId as `0x${string}`],
    }),
    value: '0',
    operation: 0,
  }

  if (!partOrderId) return [cancelTwapOrderTx]

  const cancelTwapPartOrderTx = {
    to: settlementAddress,
    data: encodeFunctionData({
      abi: settlementAbi,
      functionName: 'invalidateOrder',
      args: [partOrderId as `0x${string}`],
    }),
    value: '0',
    operation: 0,
  }

  return [cancelTwapOrderTx, cancelTwapPartOrderTx]
}

// TODO: we might need a custom method for estimating gas on Linea
export async function estimateCancelTwapOrderTxs(context: CancelTwapOrderContext): Promise<bigint> {
  if (isZkSyncChain(context.chainId)) {
    throw new Error('estimateCancelTwapOrderTxs: Please, re-enable zkSync chain estimation.')

    // We need to use a different estimation method for zkSync chains (like we did for Lens).
    // See the function estimateZkSyncCancelTwapOrderTxs for details
    // return estimateZkSyncCancelTwapOrderTxs(context)
  }

  const {
    composableCowAddress,
    composableCowAbi,
    settlementAddress,
    settlementAbi,
    orderId,
    partOrderId,
    publicClient,
    account,
  } = context
  if (!publicClient || !account) throw new Error('estimateCancelTwapOrderTxs: publicClient and account required')

  const cancelComposableCowTxCost = await publicClient.estimateContractGas({
    address: composableCowAddress,
    abi: composableCowAbi,
    functionName: 'remove',
    args: [orderId as `0x${string}`],
    account,
  })

  if (!partOrderId) return cancelComposableCowTxCost

  const cancelPartOrderTx = await publicClient.estimateContractGas({
    address: settlementAddress,
    abi: settlementAbi,
    functionName: 'invalidateOrder',
    args: [partOrderId as `0x${string}`],
    account,
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
/*
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

let APP_DATA_HASH: string | undefined

function getAppDataHash(): string {
  if (!APP_DATA_HASH) {
    APP_DATA_HASH = toKeccak256(JSON.stringify({ version: '1.6.0', appCode: 'CoW Swap', metadata: {} }))
  }
  return APP_DATA_HASH
}

const FAKE_OWNER = '0x330d9F4906EDA1f73f668660d1946bea71f48827'

const START_TIME = Math.floor(Date.now() / 1000)

const zkSyncChain: ChainInfo =
  ALL_SUPPORTED_CHAINS.find(({ id }) => isZkSyncChain(id)) || ALL_SUPPORTED_CHAINS_MAP[SupportedChainId.MAINNET]

const zkSyncChainId = zkSyncChain.id as SupportedChainId

const FAKE_TWAP_ORDER: TWAPOrder = {
  sellAmount: CurrencyAmount.fromRawAmount(WRAPPED_NATIVE_CURRENCIES[zkSyncChainId], 100_000_000_000),
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
*/
