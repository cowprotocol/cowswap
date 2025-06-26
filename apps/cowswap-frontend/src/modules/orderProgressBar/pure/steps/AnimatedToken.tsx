import { ReactElement } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { TokenLogo } from '@cowprotocol/tokens'
import { ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import * as styledEl from './styled'

const ICON_SIZE = 136
const MOBILE_ICON_SIZE = 72

export function AnimatedTokens({
  sellToken,
  buyToken,
}: {
  sellToken: Currency | TokenWithLogo | null | undefined
  buyToken: Currency | TokenWithLogo | null | undefined
}): ReactElement {
  return (
    <styledEl.AnimatedTokensWrapper>
      <styledEl.TokenWrapper position="left" size={ICON_SIZE} sizeMobile={MOBILE_ICON_SIZE}>
        <TokenLogo token={sellToken} size={ICON_SIZE} sizeMobile={MOBILE_ICON_SIZE} />
      </styledEl.TokenWrapper>
      <styledEl.TokenWrapper position="center" size={ICON_SIZE} sizeMobile={MOBILE_ICON_SIZE}>
        <TokenLogo token={buyToken} size={ICON_SIZE} sizeMobile={MOBILE_ICON_SIZE} />
      </styledEl.TokenWrapper>
      <styledEl.TokenWrapper
        position="right"
        bgColor={`var(${UI.COLOR_BLUE_900_PRIMARY})`}
        size={ICON_SIZE}
        sizeMobile={MOBILE_ICON_SIZE}
      >
        <ProductLogo
          variant={ProductVariant.CowSwap}
          theme={'dark'}
          overrideHoverColor={'#65D9FF'}
          height={58}
          heightMobile={32}
          logoIconOnly
        />
      </styledEl.TokenWrapper>
    </styledEl.AnimatedTokensWrapper>
  )
}
