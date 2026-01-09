import { ReactNode } from 'react'

import type { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans, useLingui } from '@lingui/react/macro'

import { StepContent, SwapSummaryRow } from './styled'

import { COW_PROTOCOL_NAME } from '../../constants'
import { SwapAndBridgeStatus, SwapResultContext } from '../../types'
import { BridgeDetailsContainer } from '../BridgeDetailsContainer'
import { SwapResultContent } from '../contents/SwapResultContent'
import { swapStatusIcons, swapStatusTitlePrefixes } from '../StopStatus'

interface SwapStepRowProps {
  swapResultContext: SwapResultContext | undefined
  sourceChainName: string
  sourceAmounts: {
    sellAmount: CurrencyAmount<Currency>
    buyAmount: CurrencyAmount<Currency>
  }
  children: ReactNode
}

export function SwapStepRow({
  swapResultContext,
  sourceAmounts,
  sourceChainName,
  children,
}: SwapStepRowProps): ReactNode {
  const { i18n } = useLingui()
  const isPending = !swapResultContext
  const swapStatus = isPending ? SwapAndBridgeStatus.PENDING : SwapAndBridgeStatus.DONE
  const titlePrefix: string = i18n._(swapStatusTitlePrefixes[swapStatus])

  return (
    <SwapSummaryRow>
      <b>
        <Trans>Swap</Trans>
      </b>
      <StepContent>
        <BridgeDetailsContainer
          isCollapsible
          defaultExpanded={isPending}
          status={swapStatus}
          statusIcon={swapStatusIcons[swapStatus]}
          protocolIconShowOnly="first"
          protocolIconSize={21}
          circleSize={21}
          titlePrefix=""
          protocolName={`${titlePrefix} ${COW_PROTOCOL_NAME}`}
          chainName={sourceChainName}
          sellAmount={sourceAmounts.sellAmount}
          buyAmount={sourceAmounts.buyAmount}
        >
          {swapResultContext ? (
            <SwapResultContent context={swapResultContext} sellAmount={sourceAmounts.sellAmount} />
          ) : (
            children
          )}
        </BridgeDetailsContainer>
      </StepContent>
    </SwapSummaryRow>
  )
}
