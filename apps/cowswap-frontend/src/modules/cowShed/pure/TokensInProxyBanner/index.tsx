import { ReactNode } from 'react'

import { TokenLogo } from '@cowprotocol/tokens'
import { BannerOrientation, InlineBanner, StatusColorVariant, TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { TokenToRefund } from '../../hooks/useTokensToRefund'

const TokenLogoStyled = styled(TokenLogo)`
  display: inline-block;
  position: relative;
  top: 3px;
`

const TokensList = styled.ul`
  margin: 0;
  padding-left: 10px;

  li {
    margin: 4px 0;
    padding: 0;
  }
`

interface TokensInProxyBannerProps {
  tokensToRefund: TokenToRefund[]
}

export function TokensInProxyBanner({ tokensToRefund }: TokensInProxyBannerProps): ReactNode {
  const firstToken = tokensToRefund[0]

  if (!firstToken) return null

  return (
    <InlineBanner bannerType={StatusColorVariant.Warning} orientation={BannerOrientation.Horizontal}>
      <div>
        Your proxy account contains following tokens:
        <TokensList>
          {tokensToRefund.map(({ token, balance }) => {
            const amount = CurrencyAmount.fromRawAmount(token, balance.toString())

            return (
              <li key={token.address}>
                <TokenAmount amount={amount} tokenSymbol={token} /> <TokenLogoStyled size={16} token={token} />
              </li>
            )
          })}
        </TokensList>
        Something could go wrong and you can withdraw your funds at <strong>Recover funds</strong> tab
      </div>
    </InlineBanner>
  )
}
