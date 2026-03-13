import { ReactNode } from 'react'

import { BannerOrientation, InlineBanner, LinkStyledButton, StatusColorVariant } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import * as styledEl from './TwapPrototypeProxy.styled'

import { useOpenTwapPrototypeProxyPage } from '../../hooks/useOpenTwapPrototypeProxyPage'
import { useTwapPrototypeProxy } from '../../hooks/useTwapPrototypeProxy'

export function TwapPrototypeProxyBanner(): ReactNode {
  const openProxyPage = useOpenTwapPrototypeProxyPage()
  const { hasAnyProxyFunds, hasActiveFunds, hasClaimableFunds } = useTwapPrototypeProxy()

  if (!hasAnyProxyFunds) {
    return null
  }

  if (hasActiveFunds) {
    return (
      <styledEl.BannerWrapper>
        <InlineBanner bannerType={StatusColorVariant.Info} orientation={BannerOrientation.Horizontal}>
          <Trans>Funds for your TWAP orders are held in your </Trans>
          <styledEl.BannerLink onClick={openProxyPage}>
            <Trans>TWAP proxy account</Trans>
          </styledEl.BannerLink>
        </InlineBanner>
      </styledEl.BannerWrapper>
    )
  }

  if (hasClaimableFunds) {
    return (
      <styledEl.BannerWrapper>
        <InlineBanner bannerType={StatusColorVariant.Info} orientation={BannerOrientation.Horizontal}>
          <Trans>You have unclaimed funds in your TWAP proxy account.</Trans>{' '}
          <LinkStyledButton onClick={openProxyPage}>
            <Trans>View TWAP proxy account</Trans>
          </LinkStyledButton>
        </InlineBanner>
      </styledEl.BannerWrapper>
    )
  }

  return null
}
