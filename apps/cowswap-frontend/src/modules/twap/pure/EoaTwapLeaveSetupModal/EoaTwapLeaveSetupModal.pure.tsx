import { ReactNode, useCallback } from 'react'

import { Dialog, InlineBanner, Modal, ModalHeader, StatusColorVariant } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import * as styledEl from './EoaTwapLeaveSetupModal.styled'

import { EoaTwapLeaveConfirmationVariant } from '../../utils/getEoaTwapLeaveConfirmationVariant'

export interface EoaTwapLeaveSetupModalProps {
  isOpen: boolean
  variant: EoaTwapLeaveConfirmationVariant
  symbol: string
  onLeave(): void
  onContinue(): void
}

export function EoaTwapLeaveSetupModal({
  isOpen,
  variant,
  symbol,
  onLeave,
  onContinue,
}: EoaTwapLeaveSetupModalProps): ReactNode {
  const description =
    variant === 'afterApproval'
      ? t`You'll return to the TWAP form with your values preserved and a fresh quote. This order won't be submitted.`
      : t`You'll return to the TWAP form with your values preserved and a fresh quote. Closing this tracker won't cancel the wallet request.`

  const infoBannerTitle =
    variant === 'afterApproval' ? t`Your ${symbol} approval stays valid` : t`Reject the wallet request to stop`

  const infoBannerDescription =
    variant === 'afterApproval'
      ? t`You won't need to approve it again unless your allowance changes.`
      : t`If you approve it after leaving, the order may still be submitted.`

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onContinue()
      }
    },
    [onContinue],
  )

  return (
    <Dialog isOpen={isOpen} onOpenChange={handleOpenChange} variant="narrow">
      <Modal.Root>
        <ModalHeader title={<Trans>Leave TWAP setup?</Trans>} titleAs={Dialog.Title} />

        <Modal.Content>
          <styledEl.Content>
            <styledEl.Description>{description}</styledEl.Description>

            <InlineBanner bannerType={StatusColorVariant.Info} hideIcon borderRadius="16px">
              <styledEl.InfoBannerContent>
                <styledEl.InfoBannerTitle>{infoBannerTitle}</styledEl.InfoBannerTitle>
                <styledEl.InfoBannerDescription>{infoBannerDescription}</styledEl.InfoBannerDescription>
              </styledEl.InfoBannerContent>
            </InlineBanner>
          </styledEl.Content>
        </Modal.Content>

        <Modal.FooterWithTwoButtons
          secondaryButton={{ label: <Trans>Leave setup</Trans>, onClick: onLeave }}
          primaryButton={{ label: <Trans>Continue setup</Trans>, onClick: onContinue }}
        />
      </Modal.Root>
    </Dialog>
  )
}
