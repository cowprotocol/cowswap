import { LpToken } from '@cowprotocol/common-const'
import {
  BannerOrientation,
  DismissableInlineBanner,
  ExternalLink,
  ProductVariant,
  StatusColorVariant,
  TokenSymbol,
  UI,
} from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { ChevronDown } from 'react-feather'

import { CoWAmmLogo, SelectPoolBtn } from './styled'

export const CoWAmmGreenLogo = (
  <CoWAmmLogo overrideColor={`var(${UI.COLOR_COWAMM_DARK_GREEN})`} variant={ProductVariant.CowAmm} logoIconOnly />
)

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const CoWAmmInlineBanner = ({ token, apyDiff }: { token: LpToken | undefined; apyDiff: number | undefined }) => {
  const apyDiffFormatted = apyDiff?.toFixed(1) || ''

  return (
    <DismissableInlineBanner
      bannerId="yieldTopBanner"
      orientation={BannerOrientation.Horizontal}
      bannerType={StatusColorVariant.Savings}
      customIcon={CoWAmmGreenLogo}
    >
      <strong>
        <Trans>Boost Your Yield with One-Click Conversion</Trans>
      </strong>
      <span>
        {token && apyDiff && apyDiff > 0 ? (
          <>
            <Trans>
              Convert your <TokenSymbol token={token} /> LP tokens into CoW AMM pools and earn up to{' '}
              <strong>+{apyDiffFormatted}%</strong> more yield compared to <TokenSymbol token={token} />. Or, swap
            </Trans>
          </>
        ) : (
          <Trans>Swap</Trans>
        )}{' '}
        <Trans>any token into CoW AMM pools to start benefiting from attractive APRs.</Trans>{' '}
        <ExternalLink href="https://cow.fi/cow-amm">
          <Trans>Learn more</Trans>
        </ExternalLink>
      </span>
    </DismissableInlineBanner>
  )
}

export const SelectAPoolButton = (
  <SelectPoolBtn>
    {CoWAmmGreenLogo}{' '}
    <span>
      <Trans>Select a pool</Trans>
    </span>{' '}
    <ChevronDown size="18" />
  </SelectPoolBtn>
)
