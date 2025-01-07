import ICON_TOKENS from '@cowprotocol/assets/svg/tokens.svg'
import { Command } from '@cowprotocol/types'
import { BannerOrientation, ClosableBanner, InlineBanner, UnderlinedLinkStyledButton } from '@cowprotocol/ui'

import * as timeago from 'timeago.js'

const BANNER_STORAGE_KEY = 'partialPermitBannerKey:v0'

const YEARS_SINCE_DEPLOYMENT = timeago.format(new Date('2021-06-08')).replace(/ ago/, '') // mainnet contract deployment date https://etherscan.io/tx/0xf49f90aa5a268c40001d1227b76bb4dd8247f18361fcad9fffd4a7a44f1320d3

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
        <b>NEW: </b>You can now chose do only minimal approvals in the
        <UnderlinedLinkStyledButton onClick={openSettings}>settings.</UnderlinedLinkStyledButton> When enabled, every
        order placed that needs approval will request only the minimum necessary to trade. When disabled, you can enjoy
        the same trusted experience CoW Swap has provided for the past {YEARS_SINCE_DEPLOYMENT}.
      </p>
    </InlineBanner>
  ))
}
