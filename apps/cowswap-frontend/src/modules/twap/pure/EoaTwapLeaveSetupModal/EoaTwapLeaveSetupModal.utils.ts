import { t } from '@lingui/core/macro'

import { EoaTwapSigningPhase, EoaTwapSigningStepState, EoaTwapSigningSteps } from '../../state/eoaTwapSigningStepAtom'
export type EoaTwapLeaveConfirmationVariant = 'default' | 'walletRequest' | 'noWayBack'

export interface EoaTwapLeaveSetupModalContent {
  title: string
  description: string
  infoBannerTitle: string
  infoBannerDescription: string
}

export function getEoaTwapLeaveConfirmationVariant(
  signingStep: EoaTwapSigningStepState | null,
): EoaTwapLeaveConfirmationVariant | null {
  if (!signingStep || signingStep.step === EoaTwapSigningSteps.Success) {
    return null
  }

  if (signingStep.lockDismiss) {
    return 'noWayBack'
  }

  return signingStep.phase === EoaTwapSigningPhase.Sign ? 'walletRequest' : 'default'
}

export function getEoaTwapLeaveSetupModalContent(
  variant: EoaTwapLeaveConfirmationVariant,
  symbol: string,
): EoaTwapLeaveSetupModalContent {
  const title = t`Leave TWAP setup?`

  if (variant === 'noWayBack') {
    return {
      title,
      description: t`You'll return to the TWAP form with your values preserved and a fresh quote, but this order has already been submitted.`,
      infoBannerTitle: t`Your order has alraedy been submitted`,
      infoBannerDescription: t`If you want to cancel it, you can do it once it appears in the oders table.`,
    }
  }

  if (variant === 'walletRequest') {
    return {
      title,
      description: t`You'll return to the TWAP form with your values preserved and a fresh quote. Closing this tracker won't cancel the wallet request.`,
      infoBannerTitle: t`Reject the wallet request to stop`,
      infoBannerDescription: t`If you approve it after leaving, the order may still be submitted.`,
    }
  }

  return {
    title,
    description: t`You'll return to the TWAP form with your values preserved and a fresh quote. This order won't be submitted.`,
    infoBannerTitle: t`Your ${symbol} approval stays valid`,
    infoBannerDescription: t`You won't need to approve it again unless your allowance changes.`,
  }
}
