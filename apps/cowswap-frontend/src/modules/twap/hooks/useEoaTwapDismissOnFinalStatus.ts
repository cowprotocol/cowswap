import { useAtomValue } from 'jotai'
import { useEffect } from 'react'

import { eoaTwapOrdersAtom } from 'entities/twap'

import { useEoaTwapSigningStep } from './useEoaTwapSigningStep'

import { TWAP_FINAL_STATUSES } from '../const'
import { EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'

export function useEoaTwapDismissOnFinalStatus(onDismiss: () => void): void {
  const signingStep = useEoaTwapSigningStep()
  const eoaTwapOrders = useAtomValue(eoaTwapOrdersAtom)

  const eventId = signingStep?.step === EoaTwapSigningSteps.Success ? signingStep.eventId : undefined
  const orderStatus = eventId ? eoaTwapOrders[eventId]?.status : undefined
  const isOrderFinalized = !!orderStatus && TWAP_FINAL_STATUSES.includes(orderStatus)

  useEffect(() => {
    if (isOrderFinalized) {
      onDismiss()
    }
  }, [isOrderFinalized, onDismiss])
}
