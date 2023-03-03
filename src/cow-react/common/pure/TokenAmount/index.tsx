// import { ThemeContext } from 'styled-components/macro'
// import { useContext } from 'react'
import { formatTokenAmount } from '@cow/utils/amountFormat'
import { FractionLike, Nullish } from '@cow/types'
import { TokenSymbol, TokenSymbolProps } from '@cow/common/pure/TokenSymbol'
import { FractionUtils } from '@cow/utils/fractionUtils'
import { LONG_PRECISION } from 'constants/index'
import { FeatureFlag } from '@cow/utils/featureFlags'
import styled from 'styled-components/macro'
import { AMOUNTS_FORMATTING_FEATURE_FLAG } from '@cow/constants/featureFlags'
import { darken } from 'polished'
// import { WarningIndicator, WarningContent } from '@cow/modules/limitOrders/pure/Orders/OrderRow/styled'
// import { MouseoverTooltipContent } from 'components/Tooltip'
// import AlertTriangle from 'assets/cow-swap/alert.svg'
// import SVG from 'react-inlinesvg'

export interface TokenAmountProps {
  amount: Nullish<FractionLike>
  defaultValue?: string
  tokenSymbol?: TokenSymbolProps['token']
  className?: string
  hideTokenSymbol?: boolean
  round?: boolean
  lowVolumeWarning?: boolean
}

const highlight = !!FeatureFlag.get(AMOUNTS_FORMATTING_FEATURE_FLAG)

export const Wrapper = styled.span<{ highlight: boolean; lowVolumeWarning?: boolean }>`
  background: ${({ highlight }) => (highlight ? 'rgba(196,18,255,0.4)' : '')};
  color: ${({ lowVolumeWarning, theme }) =>
    lowVolumeWarning ? darken(theme.darkMode ? 0 : 0.15, theme.alert) : 'inherit'};
`

export function TokenAmount({
  amount,
  defaultValue,
  className,
  tokenSymbol,
  round,
  hideTokenSymbol,
  lowVolumeWarning,
}: TokenAmountProps) {
  const title =
    FractionUtils.fractionLikeToExactString(amount, LONG_PRECISION) + (tokenSymbol ? ` ${tokenSymbol.symbol}` : '')

  // const theme = useContext(ThemeContext)
  if (!amount) return null

  const tokenSymbolElement =
    hideTokenSymbol || !tokenSymbol ? null : (
      <>
        {' '}
        <TokenSymbol token={tokenSymbol} />
      </>
    )

  return (
    <>
      <Wrapper title={title} className={className} highlight={highlight} lowVolumeWarning={lowVolumeWarning}>
        {formatTokenAmount(round ? FractionUtils.round(amount) : amount) || defaultValue}
        <span>{tokenSymbolElement}</span>

        {/* {lowVolumeWarning && (
            <WarningIndicator>
              <MouseoverTooltipContent
                wrap={false}
                bgColor={theme.alert}
                content={
                  <WarningContent>
                    For this order, network fees would be 52.11% (12.34 USDC) of your sell amount! Therefore, your order is unlikely to execute. Learn more
                  </WarningContent>
                }
                placement="bottom"
              >
                <SVG src={AlertTriangle} description="Alert" width="14" height="13" />
              </MouseoverTooltipContent>
            </WarningIndicator>
          )} */}
      </Wrapper>
    </>
  )
}
