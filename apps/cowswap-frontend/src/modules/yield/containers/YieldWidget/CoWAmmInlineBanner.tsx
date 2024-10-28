import { BannerOrientation, DismissableInlineBanner, ExternalLink, ProductVariant, UI } from '@cowprotocol/ui'

import { CoWAmmLogo } from './styled'

export const CoWAmmInlineBanner = (
  <DismissableInlineBanner
    bannerId="yieldTopBanner"
    orientation={BannerOrientation.Horizontal}
    bannerType="savings"
    customIcon={
      <CoWAmmLogo overrideColor={`var(${UI.COLOR_COWAMM_DARK_GREEN})`} variant={ProductVariant.CowAmm} logoIconOnly />
    }
  >
    <strong>Boost Your Yield with One-Click Conversion</strong>
    <span>
      Convert your UNI-V2 LP tokens into CoW AMM pools and earn up to +1.5% more yield compared to UNI-V2. Or, swap any
      token into CoW AMM pools to start benefiting from attractive APRs.{' '}
      <ExternalLink href="https://cow.fi/cow-amm">Learn more</ExternalLink>
    </span>
  </DismissableInlineBanner>
)
