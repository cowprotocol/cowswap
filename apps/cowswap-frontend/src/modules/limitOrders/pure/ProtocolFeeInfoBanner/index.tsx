import { ReactNode } from 'react'

import { BannerOrientation, DismissableInlineBanner, ExternalLink, StatusColorVariant } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

const BANNER_ID = 'limitOrders_cip74_protocol_fee_banner'
const CIP_74_URL = 'https://vote.cow.fi/#/proposal/0x0c70c8cd92accee872b52614b4fa10e3e3214f45c5b6857f7e88e910607a3c1d'

export function ProtocolFeeInfoBanner(): ReactNode {
  return (
    <DismissableInlineBanner
      bannerId={BANNER_ID}
      orientation={BannerOrientation.Horizontal}
      bannerType={StatusColorVariant.Info}
    >
      <p>
        <Trans>
          From November 13, 2025 at 14:17 (UTC), and pursuant to{' '}
          <ExternalLink href={CIP_74_URL}>CIP-74</ExternalLink>, a 2 bps (0.02%) protocol fee will apply to all
          executed orders, including any limit orders executed after this time, even if they were created earlier.
        </Trans>
      </p>
    </DismissableInlineBanner>
  )
}
