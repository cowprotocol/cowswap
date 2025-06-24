import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenLogo } from '@cowprotocol/tokens'
import { BannerOrientation, InlineBanner, StatusColorVariant, TokenSymbol } from '@cowprotocol/ui'

import { Link } from 'react-router'
import styled from 'styled-components/macro'

import { CoWShedWidgetTabs } from '../../const'
import { getShedRouteLink } from '../../utils/getShedRouteLink'

const TokenLogoStyled = styled(TokenLogo)`
  display: inline-block;
  position: relative;
  top: 3px;
`

interface TokensInProxyBannerProps {
  chainId: SupportedChainId
  token: TokenWithLogo
}

export function TokensInProxyBanner({ chainId, token }: TokensInProxyBannerProps): ReactNode {
  return (
    <InlineBanner bannerType={StatusColorVariant.Warning} orientation={BannerOrientation.Horizontal}>
      <div>
        There are some{' '}
        <strong>
          <TokenLogoStyled size={16} token={token} /> <TokenSymbol token={token} />
        </strong>{' '}
        in your proxy account. Something could go wrong and you can{' '}
        <Link to={getShedRouteLink(chainId, CoWShedWidgetTabs.RECOVER_FUNDS, token.address.toLowerCase())}>
          withdraw your funds
        </Link>
        .
      </div>
    </InlineBanner>
  )
}
