import { ReactNode } from 'react'

import { BannerOrientation, ConfirmBottomDrawerOrDialog, InlineBanner, StatusColorVariant } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

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

  const content = (
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
  )

  return (
    <ConfirmBottomDrawerOrDialog
      isOpen={isOpen}
      title={title}
      description={description}
      content={content}
      cancelLabel={t`Leave setup`}
      onCancel={onLeave}
      confirmLabel={t`Continue setup`}
      onConfirm={onContinue}
      onDismiss={onContinue}
    />
  )
}
