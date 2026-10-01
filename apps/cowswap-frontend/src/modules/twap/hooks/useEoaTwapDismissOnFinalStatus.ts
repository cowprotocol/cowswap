import { useAtomValue } from 'jotai'
import { useEffect } from 'react'

import { eoaTwapOrdersAtom } from 'entities/twap'
import ms from 'ms.macro'

import { useEoaTwapSigningStep } from './useEoaTwapSigningStep'

import { TWAP_FINAL_STATUSES } from '../const'
import { EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'

const MAX_TIMEOUT_MS = ms`24d`

export function useEoaTwapDismissOnFinalStatus(onDismiss: () => void): void {
  const signingStep = useEoaTwapSigningStep()
  const eoaTwapOrders = useAtomValue(eoaTwapOrdersAtom)

  const eventId = signingStep?.step === EoaTwapSigningSteps.Success ? signingStep.eventId : undefined
  const order = eventId ? eoaTwapOrders[eventId] : undefined
  const isOrderFinalized = !!order && TWAP_FINAL_STATUSES.includes(order.status)
  const endTimeMs = order?.order.t0 ? (order.order.t0 + order.order.t * order.order.n) * 1000 : undefined

  useEffect(() => {
    if (isOrderFinalized) {
      onDismiss()
      return
    }

    if (!endTimeMs) return

    const delay = Math.max(endTimeMs - Date.now(), 0)

    if (delay > MAX_TIMEOUT_MS) return

    const timeout = setTimeout(onDismiss, delay)

    return () => clearTimeout(timeout)
  }, [isOrderFinalized, endTimeMs, onDismiss])
}
