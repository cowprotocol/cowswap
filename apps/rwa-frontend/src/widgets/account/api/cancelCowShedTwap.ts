import { encodeFunctionData, type Hex, parseAbi } from 'viem'
import type { Config } from 'wagmi'
import { getConnection, sendTransaction, switchChain } from 'wagmi/actions'

// The app uses the production order book only, and the common-utils root entry pulls Lingui macros
/* eslint-disable @typescript-eslint/no-restricted-imports */
import {
  COMPOSABLE_COW_CONTRACT_ADDRESS,
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS,
  isSupportedChain,
  OrderStatus,
} from '@cowprotocol/cow-sdk'
/* eslint-enable @typescript-eslint/no-restricted-imports */

import { programmaticOrderApi } from '@/shared/api'

export interface CancelCowShedTwapParams {
  config: Config
  chainId: number
  twap: CowShedTwap
}

export interface CowShedTwap {
  /** Creation event ID, see `getTwapPartOrders` */
  eventId: string
  /** ComposableCoW order hash */
  hash: string
  /** Proxy that owns the TWAP on behalf of the EOA */
  cowShedAddress: string
}

const COMPOSABLE_COW_ABI = parseAbi(['function remove(bytes32 singleOrderHash)'])
const SETTLEMENT_ABI = parseAbi(['function invalidateOrder(bytes orderUid)'])
const COW_SHED_ABI = parseAbi([
  'struct Call { address target; uint256 value; bytes callData; bool allowFailure; bool isDelegateCall; }',
  'function trustedExecuteHooks(Call[] calls)',
])

/**
 * Removes the TWAP from ComposableCoW and invalidates its open part, both from the CoW Shed of the EOA,
 * the only account allowed to do either. Resolves with the transaction hash.
 */
export async function cancelCowShedTwap({ config, chainId, twap }: CancelCowShedTwapParams): Promise<Hex> {
  if (!isSupportedChain(chainId)) throw new Error(`Network ${chainId} is not supported`)
  if (getConnection(config).chainId !== chainId) await switchChain(config, { chainId })

  const { items } = await programmaticOrderApi.getTwapPartOrders(
    { eventId: twap.eventId, chainId },
    { direction: 'desc', limit: 1 },
  )
  const openPartUid = items[0]?.status === OrderStatus.OPEN ? items[0].orderUid : null

  const calls = [
    {
      target: COMPOSABLE_COW_CONTRACT_ADDRESS[chainId] as Hex,
      callData: encodeFunctionData({ abi: COMPOSABLE_COW_ABI, functionName: 'remove', args: [twap.hash as Hex] }),
    },
    ...(openPartUid
      ? [
          {
            target: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId] as Hex,
            callData: encodeFunctionData({
              abi: SETTLEMENT_ABI,
              functionName: 'invalidateOrder',
              args: [openPartUid as Hex],
            }),
          },
        ]
      : []),
  ].map((call) => ({ ...call, value: 0n, allowFailure: false, isDelegateCall: false }))

  return sendTransaction(config, {
    chainId,
    to: twap.cowShedAddress as Hex,
    data: encodeFunctionData({ abi: COW_SHED_ABI, functionName: 'trustedExecuteHooks', args: [calls] }),
  })
}
