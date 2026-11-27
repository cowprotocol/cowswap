import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { backendEnv, normalizeError } from '@cowprotocol/common-utils'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { PublicKey } from '@solana/web3.js'
import ms from 'ms.macro'
import useSWR from 'swr'
import { buildSolanaReclaimOrderParams, SAFE_TO_RECLAIM_AFTER } from 'tradingSdk/solana/buildSolanaReclaimOrderParams'

import { OrderStatus } from 'legacy/state/orders/actions'

import { useSolanaConnection } from 'common/hooks/useSolanaConnection'

import { ordersTableStateAtom } from '../state/ordersTable.atoms'
import { isParsedOrder } from '../utils/orderTableGroupUtils'

const EMPTY_IDS: ReadonlySet<string> = new Set()

const WAITING_POLL_INTERVAL = ms`1m`

interface ReclaimableRentState {
  orderIds: ReadonlySet<string>
  /** True while an order is too young to reclaim, so it qualifies on its own a few minutes later. */
  hasWaitingOrder: boolean
}

const EMPTY_STATE: ReclaimableRentState = { orderIds: EMPTY_IDS, hasWaitingOrder: false }

export interface SolanaReclaimableRent {
  /** Orders in the current list whose rent the connected wallet can still take back. */
  orderIds: ReadonlySet<string>
  refresh: () => void
  /** Drops `ids` from the list without re-reading the chain, for a reclaim already confirmed on-chain. */
  markReclaimed: (ids: string[]) => void
}

/**
 * Cancelling an order doesn't close its on-chain account, so the rent stays locked until the order
 * expires. This tells the table which cancelled orders still hold rent the connected wallet can reclaim.
 */
export function useSolanaReclaimableRent(): SolanaReclaimableRent {
  const { chainId, account } = useWalletInfo()
  const connection = useSolanaConnection()
  const { filteredOrders } = useAtomValue(ordersTableStateAtom)

  const cancelledOrders = useMemo(
    () =>
      filteredOrders
        .filter(isParsedOrder)
        .filter((order) => order.status === OrderStatus.CANCELLED)
        .map((order) => ({ id: order.id, placedAt: order.creationTime.getTime() })),
    [filteredOrders],
  )

  const { data, mutate } = useSWR(
    isSolanaChain(chainId) && account && cancelledOrders.length
      ? [chainId, account, cancelledOrders, 'useSolanaReclaimableRent']
      : null,
    async ([, owner, orders]): Promise<ReclaimableRentState> => {
      // Read before the lookup, which re-reads the clock after its RPC round trip: an earlier reading
      // can only be more inclusive, so an order the lookup drops for being too young still counts here.
      const checkedAt = Date.now()

      try {
        const reclaimable = await buildSolanaReclaimOrderParams(connection, new PublicKey(owner), orders, backendEnv)

        return {
          orderIds: new Set(reclaimable.map(({ id }) => id)),
          hasWaitingOrder: orders.some(({ placedAt }) => checkedAt - placedAt <= SAFE_TO_RECLAIM_AFTER),
        }
      } catch (err: unknown) {
        // Swallowing this would hide the entry with no trace of why, and the table has no error surface
        console.error('[reclaimable rent] failed to read order accounts', normalizeError(err))
        throw err
      }
    },
    {
      ...SWR_NO_REFRESH_OPTIONS,
      // Nothing else in the table notices an order ageing out of its safety window, so poll while one
      // is waiting and stop as soon as none is.
      refreshInterval: (latest) => (latest?.hasWaitingOrder ? WAITING_POLL_INTERVAL : 0),
    },
  )

  return useMemo(
    () => ({
      orderIds: data?.orderIds ?? EMPTY_IDS,
      refresh: () => void mutate(),
      markReclaimed: (ids: string[]) =>
        void mutate(
          (current = EMPTY_STATE) => ({
            ...current,
            orderIds: new Set([...current.orderIds].filter((id) => !ids.includes(id))),
          }),
          { revalidate: false },
        ),
    }),
    [data, mutate],
  )
}
