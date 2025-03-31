import { TokenWithLogo } from "@cowprotocol/common-const"
import { TokenLogo } from "@cowprotocol/tokens"
import { ProductLogo, ProductVariant } from "@cowprotocol/ui"
import { Currency } from "@uniswap/sdk-core"

import * as styledEl from '../styled'

function AnimatedTokens({
  sellToken,
  buyToken,
}: {
  sellToken: Currency | TokenWithLogo | null | undefined
  buyToken: Currency | TokenWithLogo | null | undefined
}): JSX.Element {
  const ICON_SIZE = 136
  const MOBILE_ICON_SIZE = 72

  return (
    <styledEl.AnimatedTokensWrapper>
      <styledEl.TokenWrapper position="left" size={ICON_SIZE} sizeMobile={MOBILE_ICON_SIZE}>
        <TokenLogo token={sellToken} size={ICON_SIZE} sizeMobile={MOBILE_ICON_SIZE} />
      </styledEl.TokenWrapper>
      <styledEl.TokenWrapper position="center" size={ICON_SIZE} sizeMobile={MOBILE_ICON_SIZE}>
        <TokenLogo token={buyToken} size={ICON_SIZE} sizeMobile={MOBILE_ICON_SIZE} />
      </styledEl.TokenWrapper>
      <styledEl.TokenWrapper position="right" bgColor={'#012F7A'} size={ICON_SIZE} sizeMobile={MOBILE_ICON_SIZE}>
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

export default AnimatedTokens
