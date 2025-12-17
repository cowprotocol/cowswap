import { ReactNode } from 'react'

import { BannerOrientation, DismissableInlineBanner, ExternalLink, StatusColorVariant } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { BANNER_IDS } from 'common/constants/banners'

const BANNER_ID = BANNER_IDS.LIMIT_ORDERS_PROTOCOL_FEE
const CIP_74_URL = 'https://vote.cow.fi/#/proposal/0x0c70c8cd92accee872b52614b4fa10e3e3214f45c5b6857f7e88e910607a3c1d'
const PROTOCOL_FEE_START_DATETIME_UTC = 'November 26, 2025 at 00:00 (UTC)'

export interface ProtocolFeeInfoBannerProps {
  margin?: string
}

export function ProtocolFeeInfoBanner({ margin = 'auto' }: ProtocolFeeInfoBannerProps = {}): ReactNode {
  return (
    <DismissableInlineBanner
      bannerId={BANNER_ID}
      orientation={BannerOrientation.Horizontal}
      bannerType={StatusColorVariant.Info}
      margin={margin}
    >
      <p>
        <Trans>
          From {PROTOCOL_FEE_START_DATETIME_UTC}, and pursuant to <ExternalLink href={CIP_74_URL}>CIP-74</ExternalLink>,
          a 2 bps (0.02%) protocol fee will apply to all executed orders, including any limit and TWAP orders executed
          after this time, even if they were created earlier.
        </Trans>
      </p>
    </DismissableInlineBanner>
  )
}
