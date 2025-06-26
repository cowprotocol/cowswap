import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import ms from 'ms.macro'

import { ONCHAIN_TRANSACTIONS_EVENTS, OnchainTxEvents } from 'modules/onchainTransactions'

import { removeInFlightOrderIdAtom } from '../state/ethFlowInFlightOrderIdsAtom'

const DELAY_REMOVAL_ETH_FLOW_ORDER_ID_MILLISECONDS = ms`2m` // Delay removing the order ID since the creation time its mined (minor precaution just to avoid edge cases of delay in indexing times affect the collision detection

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function InFlightOrderFinalizeUpdater() {
  const removeInFlightOrderId = useSetAtom(removeInFlightOrderIdAtom)

  useEffect(() => {
    const listener = ONCHAIN_TRANSACTIONS_EVENTS.on({
      event: OnchainTxEvents.BEFORE_TX_FINALIZE,
      handler: ({ transaction }) => {
        if (!transaction.ethFlow) return

        const ethFlowInfo = transaction.ethFlow
        const { orderId } = ethFlowInfo

        // Remove inflight order ids, after a delay to avoid creating the same again in quick succession
        setTimeout(() => removeInFlightOrderId(orderId), DELAY_REMOVAL_ETH_FLOW_ORDER_ID_MILLISECONDS)
      },
    })

    return () => {
      ONCHAIN_TRANSACTIONS_EVENTS.off(listener)
    }
  }, [removeInFlightOrderId])

  return null
}
