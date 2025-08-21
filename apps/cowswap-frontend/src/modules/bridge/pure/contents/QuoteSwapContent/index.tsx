import { ReactNode } from 'react'

import { isTruthy } from '@cowprotocol/common-utils'
import { InfoTooltip, PercentDisplay } from '@cowprotocol/ui'
import { Percent } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { ProxyRecipient } from 'modules/accountProxy'
import { ReceiveAmountTitle, TradeFeesAndCosts, ConfirmDetailsItem } from 'modules/trade'
import { BRIDGE_QUOTE_ACCOUNT } from 'modules/tradeQuote'
import { RowSlippage } from 'modules/tradeWidgetAddons'

import { QuoteSwapContext } from '../../../types'
import { ProxyAccountBanner } from '../../ProxyAccountBanner'
import { TokenAmountDisplay } from '../../TokenAmountDisplay'

interface QuoteDetailsContentProps {
  context: QuoteSwapContext
  hideRecommendedSlippage?: boolean
}

interface ContentItem {
  withTimelineDot?: boolean
  label?: ReactNode
  content: ReactNode
}

function createExpectedReceiveContent(
  buyAmount: QuoteSwapContext['buyAmount'],
  expectedReceiveUsdValue: QuoteSwapContext['expectedReceiveUsdValue'],
  slippagePercentDisplay: Percent,
): ContentItem {
  return {
    withTimelineDot: true,
    label: (
      <>
        {t`Expected to receive`}{' '}
        <InfoTooltip
          content={
            <>
              {t`The estimated amount you'll receive after estimated network costs and the max slippage setting`} (
              <PercentDisplay percent={slippagePercentDisplay.toFixed(2)} />
              ).
            </>
          }
          size={14}
        />
      </>
    ),
    content: <TokenAmountDisplay displaySymbol currencyAmount={buyAmount} usdValue={expectedReceiveUsdValue} />,
  }
}

function createSlippageContent(
  slippage: Percent,
  hideRecommendedSlippage: boolean,
  isSlippageModified: boolean,
): ContentItem {
  const slippageLabel = <>{t`Max. swap slippage`} </>
  const slippagePercentDisplay = (
    <RowSlippage
      slippageLabel={slippageLabel}
      allowedSlippage={slippage}
      isSlippageModified={isSlippageModified}
      hideRecommendedSlippage={hideRecommendedSlippage}
      isTradePriceUpdating={false}
    />
  )

  return {
    withTimelineDot: true,
    content: slippagePercentDisplay,
  }
}

function createRecipientContent(recipient: QuoteSwapContext['recipient'], chainId: number): ContentItem {
  return {
    withTimelineDot: true,
    label: (
      <>
        {t`Recipient`} <InfoTooltip content={t`The address that will receive the tokens.`} size={14} />
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
        <b>
          <Trans>Min. to receive</Trans>
        </b>
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
    isSlippageModified,
  },
  hideRecommendedSlippage,
}: QuoteDetailsContentProps): ReactNode {
  const isBridgeQuoteRecipient = recipient === BRIDGE_QUOTE_ACCOUNT
  const contents = [
    createExpectedReceiveContent(buyAmount, expectedReceiveUsdValue, slippage),
    createSlippageContent(slippage, !!hideRecommendedSlippage, isSlippageModified),
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
