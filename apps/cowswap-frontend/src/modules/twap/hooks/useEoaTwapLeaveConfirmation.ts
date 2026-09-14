import { useCallback, useState } from 'react'

import { useEoaTwapSigningStep } from './useEoaTwapSigningStep'

import {
  EoaTwapLeaveConfirmationVariant,
  getEoaTwapLeaveConfirmationVariant,
} from '../utils/getEoaTwapLeaveConfirmationVariant'

export interface EoaTwapLeaveSetupModalProps {
  isOpen: boolean
  variant: EoaTwapLeaveConfirmationVariant
  symbol: string
  onLeave(): void
  onContinue(): void
}

interface UseEoaTwapLeaveConfirmationParams {
  symbol: string
  onDismiss(): void
}

interface UseEoaTwapLeaveConfirmationReturn {
  isCloseHidden: boolean
  leaveSetupModalProps: EoaTwapLeaveSetupModalProps | null
  onDismissRequest(): void
}

export function useEoaTwapLeaveConfirmation({
  symbol,
  onDismiss,
}: UseEoaTwapLeaveConfirmationParams): UseEoaTwapLeaveConfirmationReturn {
  const signingStep = useEoaTwapSigningStep()
  const [leaveConfirmationVariant, setLeaveConfirmationVariant] = useState<EoaTwapLeaveConfirmationVariant | null>(null)

  const isCloseHidden = signingStep?.lockDismiss === true

  const onContinue = useCallback(() => {
    setLeaveConfirmationVariant(null)
  }, [])

  const onLeave = useCallback(() => {
    setLeaveConfirmationVariant(null)
    onDismiss()
  }, [onDismiss])

  const onDismissRequest = useCallback(() => {
    const variant = getEoaTwapLeaveConfirmationVariant(signingStep)

    if (!variant) {
      onDismiss()
      return
    }

    setLeaveConfirmationVariant(variant)
  }, [onDismiss, signingStep])

  const leaveSetupModalProps =
    leaveConfirmationVariant !== null
      ? {
          isOpen: true,
          variant: leaveConfirmationVariant,
          symbol,
          onLeave,
          onContinue,
        }
      : null

  return {
    isCloseHidden,
    leaveSetupModalProps,
    onDismissRequest,
  }
}
