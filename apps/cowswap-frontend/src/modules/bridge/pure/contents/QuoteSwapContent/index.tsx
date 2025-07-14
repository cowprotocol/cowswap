import { ReactNode } from 'react'

import { isTruthy } from '@cowprotocol/common-utils'
import { InfoTooltip, PercentDisplay } from '@cowprotocol/ui'

import { ProxyRecipient } from 'modules/cowShed'
import { ReceiveAmountTitle, TradeFeesAndCosts, ConfirmDetailsItem } from 'modules/trade'
import { BRIDGE_QUOTE_ACCOUNT } from 'modules/tradeQuote'

import { QuoteSwapContext } from '../../../types'
import { ProxyAccountBanner } from '../../ProxyAccountBanner'
import { TokenAmountDisplay } from '../../TokenAmountDisplay'

interface QuoteDetailsContentProps {
  context: QuoteSwapContext
}

interface ContentItem {
  withTimelineDot?: boolean
  label: ReactNode
  content: ReactNode
}

function createExpectedReceiveContent(
  buyAmount: QuoteSwapContext['buyAmount'],
  expectedReceiveUsdValue: QuoteSwapContext['expectedReceiveUsdValue'],
  slippagePercentDisplay: ReactNode,
): ContentItem {
  return {
    withTimelineDot: true,
    label: (
      <>
        Expected to receive{' '}
        <InfoTooltip
          content={
            <>
              The estimated amount you\'ll receive after estimated network costs and the max slippage setting (
              {slippagePercentDisplay}).
            </>
          }
          size={14}
        />
      </>
    ),
    content: <TokenAmountDisplay displaySymbol currencyAmount={buyAmount} usdValue={expectedReceiveUsdValue} />,
  }
}

function createSlippageContent(slippagePercentDisplay: ReactNode): ContentItem {
  return {
    withTimelineDot: true,
    label: (
      <>
        Max. swap slippage{' '}
        <InfoTooltip
          content="CoW Swap dynamically adjusts your slippage tolerance to ensure your trade executes quickly while still getting the best price. Trades are protected from MEV, so your slippage can't be exploited!"
          size={14}
        />
      </>
    ),
    content: slippagePercentDisplay,
  }
}

function createRecipientContent(recipient: QuoteSwapContext['recipient'], chainId: number): ContentItem {
  return {
    withTimelineDot: true,
    label: (
      <>
        Recipient <InfoTooltip content="The address that will receive the tokens." size={14} />
      </>
    ),
    content: <ProxyRecipient recipient={recipient} chainId={chainId} />,
  }
}

function createMinReceiveContent(
  minReceiveAmount: QuoteSwapContext['minReceiveAmount'],
  minReceiveUsdValue: QuoteSwapContext['minReceiveUsdValue'],
): ContentItem {
  return {
    label: (
      <ReceiveAmountTitle>
        <b>Min. to receive</b>
      </ReceiveAmountTitle>
    ),
    content: (
      <b>
        <TokenAmountDisplay displaySymbol currencyAmount={minReceiveAmount} usdValue={minReceiveUsdValue} />
      </b>
    ),
  }
}

export function QuoteSwapContent({
  context: {
    receiveAmountInfo,
    sellAmount,
    buyAmount,
    slippage,
    recipient,
    minReceiveAmount,
    minReceiveUsdValue,
    expectedReceiveUsdValue,
  },
}: QuoteDetailsContentProps): ReactNode {
  const slippagePercentDisplay = <PercentDisplay percent={slippage.toFixed(2)} />

  const isBridgeQuoteRecipient = recipient === BRIDGE_QUOTE_ACCOUNT
  const contents = [
    createExpectedReceiveContent(buyAmount, expectedReceiveUsdValue, slippagePercentDisplay),
    createSlippageContent(slippagePercentDisplay),
    !isBridgeQuoteRecipient && createRecipientContent(recipient, sellAmount.currency.chainId),
    createMinReceiveContent(minReceiveAmount, minReceiveUsdValue),
  ]

  return (
    <>
      <TradeFeesAndCosts receiveAmountInfo={receiveAmountInfo} />
      {contents.filter(isTruthy).map(({ withTimelineDot, label, content }, index) => (
        <ConfirmDetailsItem key={index} withTimelineDot={withTimelineDot} label={label}>
          {content}
        </ConfirmDetailsItem>
      ))}
      {!isBridgeQuoteRecipient && <ProxyAccountBanner recipient={recipient} chainId={sellAmount.currency.chainId} />}
    </>
  )
}
