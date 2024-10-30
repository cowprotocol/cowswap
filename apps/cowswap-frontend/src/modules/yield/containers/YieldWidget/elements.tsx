import { LpToken } from '@cowprotocol/common-const'
import {
  BannerOrientation,
  DismissableInlineBanner,
  ExternalLink,
  ProductVariant,
  TokenSymbol,
  UI,
} from '@cowprotocol/ui'

import { ChevronDown } from 'react-feather'

import { CoWAmmLogo, SelectPoolBtn } from './styled'

export const CoWAmmGreenLogo = (
  <CoWAmmLogo overrideColor={`var(${UI.COLOR_COWAMM_DARK_GREEN})`} variant={ProductVariant.CowAmm} logoIconOnly />
)

export const CoWAmmInlineBanner = ({ token, apyDiff }: { token: LpToken | undefined; apyDiff: number | undefined }) => {
  return (
    <DismissableInlineBanner
      bannerId="yieldTopBanner"
      orientation={BannerOrientation.Horizontal}
      bannerType="savings"
      customIcon={CoWAmmGreenLogo}
    >
      <strong>Boost Your Yield with One-Click Conversion</strong>
      <span>
        {token && apyDiff && apyDiff > 0 ? (
          <>
            Convert your <TokenSymbol token={token} /> LP tokens into CoW AMM pools and earn up to{' '}
            <strong>+{apyDiff}%</strong> more yield compared to <TokenSymbol token={token} />. Or, swap
          </>
        ) : (
          'Swap'
        )}{' '}
        any token into CoW AMM pools to start benefiting from attractive APRs.{' '}
        <ExternalLink href="https://cow.fi/cow-amm">Learn more</ExternalLink>
      </span>
    </DismissableInlineBanner>
  )
}

export const SelectAPoolButton = (
  <SelectPoolBtn>
    {CoWAmmGreenLogo} <span>Select a pool</span> <ChevronDown size="18" />
  </SelectPoolBtn>
)
