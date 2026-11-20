import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { backendEnv } from '@cowprotocol/common-utils'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { PublicKey } from '@solana/web3.js'
import useSWR from 'swr'
import { buildSolanaReclaimOrderParams } from 'tradingSdk/solana/buildSolanaReclaimOrderParams'

import { OrderStatus } from 'legacy/state/orders/actions'

import { ordersTableStateAtom } from '../state/ordersTable.atoms'
import { isParsedOrder } from '../utils/orderTableGroupUtils'

const EMPTY_IDS: ReadonlySet<string> = new Set()

export interface SolanaReclaimableRent {
  /** Orders in the current list whose rent the connected wallet can still take back. */
  orderIds: ReadonlySet<string>
  refresh: () => void
  /**
   * Drops `ids` from the list without re-reading the chain: a reclaim transaction is only submitted, not
   * confirmed, so a read taken right after it still reports the PDA the reclaim is about to close.
   */
  markReclaimed: (ids: string[]) => void
}

/**
 * Cancelling an order doesn't close its on-chain account, so the rent stays locked until the order
 * expires. This tells the table which cancelled orders still hold rent the connected wallet can reclaim.
 */
export function useSolanaReclaimableRent(): SolanaReclaimableRent {
  const { chainId, account } = useWalletInfo()
  const { connection } = useAppKitConnection()
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
    isSolanaChain(chainId) && account && connection && cancelledOrders.length
      ? [chainId, account, cancelledOrders, 'useSolanaReclaimableRent']
      : null,
    async ([, owner, orders]) => {
      if (!connection) return EMPTY_IDS

      const reclaimable = await buildSolanaReclaimOrderParams(connection, new PublicKey(owner), orders, backendEnv)

      return new Set(reclaimable.map(({ id }) => id))
    },
    SWR_NO_REFRESH_OPTIONS,
  )

  return useMemo(
    () => ({
      orderIds: data ?? EMPTY_IDS,
      refresh: () => void mutate(),
      markReclaimed: (ids: string[]) =>
        void mutate((current) => new Set([...(current ?? EMPTY_IDS)].filter((id) => !ids.includes(id))), {
          revalidate: false,
        }),
    }),
    [data, mutate],
  )
}
