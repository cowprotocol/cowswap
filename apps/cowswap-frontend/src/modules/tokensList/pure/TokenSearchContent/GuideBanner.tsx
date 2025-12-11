import { ReactNode } from 'react'

import {
  BannerOrientation,
  ExternalLink,
  InlineBanner,
  LINK_GUIDE_ADD_CUSTOM_TOKEN,
  StatusColorVariant,
} from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

export function GuideBanner(): ReactNode {
  return (
    <InlineBanner
      margin="10px"
      width="auto"
      orientation={BannerOrientation.Horizontal}
      bannerType={StatusColorVariant.Info}
    >
      <p>
        <Trans>
          Can't find your token on the list?{' '}
          <ExternalLink href={LINK_GUIDE_ADD_CUSTOM_TOKEN}>Read our guide</ExternalLink> on how to add custom tokens.
        </Trans>
      </p>
    </InlineBanner>
  )
}
