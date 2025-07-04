import { ReactElement } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { TokenLogo } from '@cowprotocol/tokens'
import { ProductLogo, ProductVariant } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { useIsDarkMode } from 'legacy/state/user/hooks'

import * as styledEl from './styled'

const ICON_SIZE = 136
const MOBILE_ICON_SIZE = 72

const TOKEN_LOGO_PROPS = {
  size: ICON_SIZE,
  sizeMobile: MOBILE_ICON_SIZE,
  hideNetworkBadge: true,
}

const TOKEN_WRAPPER_PROPS = {
  size: ICON_SIZE,
  sizeMobile: MOBILE_ICON_SIZE,
}

export function AnimatedTokens({
  sellToken,
  buyToken,
}: {
  sellToken: Currency | TokenWithLogo | null | undefined
  buyToken: Currency | TokenWithLogo | null | undefined
}): ReactElement {
  const isDarkMode = useIsDarkMode()
  const logoTheme = isDarkMode ? 'light' : 'dark'

  return (
    <styledEl.AnimatedTokensWrapper>
      <styledEl.TokenWrapper position="left" {...TOKEN_WRAPPER_PROPS}>
        <TokenLogo token={sellToken} {...TOKEN_LOGO_PROPS} />
      </styledEl.TokenWrapper>
      <styledEl.TokenWrapper position="center" {...TOKEN_WRAPPER_PROPS}>
        <TokenLogo token={buyToken} {...TOKEN_LOGO_PROPS} />
      </styledEl.TokenWrapper>
      <styledEl.TokenWrapper position="right" {...TOKEN_WRAPPER_PROPS}>
        <ProductLogo variant={ProductVariant.CowSwap} theme={logoTheme} height={58} heightMobile={32} logoIconOnly />
      </styledEl.TokenWrapper>
    </styledEl.AnimatedTokensWrapper>
  )
}
