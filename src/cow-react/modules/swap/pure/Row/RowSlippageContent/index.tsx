import { Trans } from '@lingui/macro'

import { RowFixed } from 'components/Row'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { INPUT_OUTPUT_EXPLANATION, PERCENTAGE_PRECISION } from 'constants/index'
import { StyledInfo } from '@cow/pages/Swap/styleds'
import { RowSlippageProps } from '@cow/modules/swap/containers/Row/RowSlippage'
import { StyledRowBetween, TextWrapper, ClickableText } from '@cow/modules/swap/pure/Row/styled'
import { RowStyleProps } from '@cow/modules/swap/pure/Row/typings'
import { ThemedText } from 'theme/index'
import { ETH_FLOW_SLIPPAGE } from '@cow/modules/swap/state/EthFlow/updaters/slippageUpdater'

export const getNativeSlippageTooltip = (symbols: (string | undefined)[] | undefined) => (
  <Trans>
    <p>Your slippage is MEV protected.</p>
    <p>
      When swapping {symbols?.[0] || 'a native currency'}, slippage tolerance is defaulted to{' '}
      {ETH_FLOW_SLIPPAGE.toSignificant(PERCENTAGE_PRECISION)}% to ensure a high likelihood of order matching, even in
      volatile market situations.
    </p>
  </Trans>
)
export const getNonNativeSlippageTooltip = () => (
  <Trans>
    <p>Your slippage is MEV protected: all orders are submitted with tight spread (0.1%) on-chain.</p>
    <p>The slippage you pick here enables a resubmission of your order in case of unfavourable price movements.</p>
    <p>{INPUT_OUTPUT_EXPLANATION}</p>
  </Trans>
)

export interface RowSlippageContentProps extends RowSlippageProps {
  toggleSettings: () => void
  displaySlippage: string
  isEthFlow: boolean
  symbols?: (string | undefined)[]
  wrappedSymbol?: string

  styleProps?: RowStyleProps
}

export function RowSlippageContent(props: RowSlippageContentProps) {
  const { showSettingOnClick, toggleSettings, displaySlippage, isEthFlow, symbols, styleProps } = props

  return (
    <StyledRowBetween {...styleProps}>
      <RowFixed>
        <TextWrapper>
          {isEthFlow ? (
            <Trans>
              Slippage tolerance{' '}
              <ThemedText.Warn display="inline-block" override>
                (modified)
              </ThemedText.Warn>
            </Trans>
          ) : showSettingOnClick ? (
            <ClickableText onClick={toggleSettings}>
              <Trans>Slippage tolerance</Trans>
            </ClickableText>
          ) : (
            <Trans>Slippage tolerance</Trans>
          )}
        </TextWrapper>
        <MouseoverTooltipContent
          wrap
          content={isEthFlow ? getNativeSlippageTooltip(symbols) : getNonNativeSlippageTooltip()}
        >
          <StyledInfo />
        </MouseoverTooltipContent>
      </RowFixed>
      <TextWrapper textAlign="right">
        {showSettingOnClick ? (
          <ClickableText onClick={toggleSettings}>{displaySlippage}</ClickableText>
        ) : (
          <span>{displaySlippage}</span>
        )}
      </TextWrapper>
    </StyledRowBetween>
  )
}
