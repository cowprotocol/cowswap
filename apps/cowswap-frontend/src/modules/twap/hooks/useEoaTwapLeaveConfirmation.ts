import { useCallback, useEffect, useMemo, useState } from 'react'

import { useEoaTwapSigningStep } from './useEoaTwapSigningStep'

import { EoaTwapLeaveSetupModalProps } from '../pure/EoaTwapLeaveSetupModal/EoaTwapLeaveSetupModal.pure'
import {
  EoaTwapLeaveConfirmationVariant,
  getEoaTwapLeaveConfirmationVariant,
} from '../pure/EoaTwapLeaveSetupModal/EoaTwapLeaveSetupModal.utils'

interface UseEoaTwapLeaveConfirmationParams {
  symbol: string
  onDismiss(): void
}

interface UseEoaTwapLeaveConfirmationReturn {
  lockDismiss: boolean
  leaveSetupModalProps: EoaTwapLeaveSetupModalProps | null
  onDismissRequest(): void
}

export function useEoaTwapLeaveConfirmation({
  symbol,
  onDismiss,
}: UseEoaTwapLeaveConfirmationParams): UseEoaTwapLeaveConfirmationReturn {
  const signingStep = useEoaTwapSigningStep()
  const [leaveConfirmationVariant, setLeaveConfirmationVariant] = useState<EoaTwapLeaveConfirmationVariant | null>(null)

  const lockDismiss = !!signingStep?.lockDismiss

  const onContinue = useCallback(() => {
    setLeaveConfirmationVariant(null)
  }, [])

  const onLeave = useCallback(() => {
    if (lockDismiss) {
      return
    }

    setLeaveConfirmationVariant(null)
    onDismiss()
  }, [lockDismiss, onDismiss])

  const onDismissRequest = useCallback(() => {
    const variant = getEoaTwapLeaveConfirmationVariant(signingStep)

    if (!variant) {
      onLeave()
      return
    }

    setLeaveConfirmationVariant(variant)
  }, [onLeave, signingStep])

  useEffect(() => {
    if (!leaveConfirmationVariant) {
      return
    }

    const currentVariant = getEoaTwapLeaveConfirmationVariant(signingStep)

    if (currentVariant === null || leaveConfirmationVariant !== currentVariant) {
      setLeaveConfirmationVariant(null)
    }
  }, [leaveConfirmationVariant, signingStep])

  const leaveSetupModalProps = useMemo(() => {
    return (
      leaveConfirmationVariant
        ? {
            isOpen: true,
            variant: leaveConfirmationVariant,
            symbol,
            onLeave,
            onContinue,
          }
        : {
            isOpen: false,
            variant: 'walletRequest',
            symbol: '',
            onLeave: () => {},
            onContinue: () => {},
          }
    ) satisfies EoaTwapLeaveSetupModalProps
  }, [leaveConfirmationVariant, symbol, onLeave, onContinue])

  return {
    lockDismiss,
    leaveSetupModalProps,
    onDismissRequest,
  }
}
