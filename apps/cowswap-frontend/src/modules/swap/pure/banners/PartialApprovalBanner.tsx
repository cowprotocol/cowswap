import ICON_TOKENS from '@cowprotocol/assets/svg/tokens.svg'
import { Command } from '@cowprotocol/types'
import { BannerOrientation, ClosableBanner, InlineBanner, UnderlinedLinkStyledButton } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

const BANNER_STORAGE_KEY = 'partialPermitBannerKey:v0'

type PartialApprovalBannerProps = {
  isApprovalNeeded?: boolean
  openSettings: Command
}

export function PartialApprovalBanner({ isApprovalNeeded, openSettings }: PartialApprovalBannerProps) {
  if (!isApprovalNeeded) {
    return null
  }

  return ClosableBanner(BANNER_STORAGE_KEY, (onClose) => (
    <InlineBanner
      bannerType="success"
      orientation={BannerOrientation.Horizontal}
      customIcon={ICON_TOKENS}
      iconSize={32}
      onClose={onClose}
    >
      <p>
        <b>NEW: </b>You can now choose to do minimal token approvals in the <Link onClick={openSettings}>settings</Link>.
      </p>
    </InlineBanner>
  ))
}

const Link = styled(UnderlinedLinkStyledButton)`
  padding: 0;
`
