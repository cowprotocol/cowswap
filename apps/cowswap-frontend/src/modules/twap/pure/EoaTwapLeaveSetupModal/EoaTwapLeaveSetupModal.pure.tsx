import { ReactNode, useCallback } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import {
  BannerOrientation,
  BottomDrawer,
  BottomDrawerOrDialog,
  Dialog,
  InlineBanner,
  Media,
  Modal,
  ModalHeader,
  StatusColorVariant,
} from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import * as styledEl from './EoaTwapLeaveSetupModal.styled'
import { EoaTwapLeaveConfirmationVariant, getEoaTwapLeaveSetupModalContent } from './EoaTwapLeaveSetupModal.utils'

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
  const { title, description, infoBannerTitle, infoBannerDescription } = getEoaTwapLeaveSetupModalContent(
    variant,
    symbol,
  )

  const isUpToExtraSmall = useMediaQuery(Media.upToExtraSmall(false))

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onContinue()
      }
    },
    [onContinue],
  )

  return (
    <BottomDrawerOrDialog isDrawer={isUpToExtraSmall} isOpen={isOpen} onOpenChange={handleOpenChange} variant="narrow">
      <Modal.Root>
        <ModalHeader title={title} titleAs={isUpToExtraSmall ? BottomDrawer.Title : Dialog.Title} />

        <Modal.Description>{description}</Modal.Description>

        <Modal.Content>
          <InlineBanner
            bannerType={StatusColorVariant.Info}
            hideIcon
            borderRadius="16px"
            orientation={BannerOrientation.Horizontal}
          >
            <p>
              <styledEl.InfoBannerTitle>{infoBannerTitle}</styledEl.InfoBannerTitle>
            </p>
            <p>{infoBannerDescription}</p>
          </InlineBanner>
        </Modal.Content>

        <Modal.FooterWithTwoButtons
          secondaryButton={{ label: <Trans>Leave setup</Trans>, onClick: onLeave }}
          primaryButton={{ label: <Trans>Continue setup</Trans>, onClick: onContinue }}
        />
      </Modal.Root>
    </BottomDrawerOrDialog>
  )
}
