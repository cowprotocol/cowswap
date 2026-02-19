import { ReactNode } from 'react'

import { isTruthy } from '@cowprotocol/common-utils'
import { InfoTooltip, PercentDisplay } from '@cowprotocol/ui'
import { Percent } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { ProxyRecipient } from 'modules/accountProxy'
import { AffiliateTraderRewardsRow } from 'modules/affiliate/containers/AffiliateTraderRewardsRow'
import { useIsRewardsRowVisible } from 'modules/affiliate/hooks/useIsRewardsRowVisible'
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
  expectedReceive: QuoteSwapContext['expectedReceive'],
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
    content: <TokenAmountDisplay displaySymbol currencyAmount={expectedReceive} usdValue={expectedReceiveUsdValue} />,
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

function createRecipientContent(
  recipient: QuoteSwapContext['recipient'],
  bridgeReceiverOverride: QuoteSwapContext['bridgeReceiverOverride'],
  chainId: number,
): ContentItem {
  return {
    withTimelineDot: true,
    label: (
      <>
        {t`Recipient`} <InfoTooltip content={t`The address that will receive the tokens.`} size={14} />
      </>
    ),
    content: <ProxyRecipient recipient={recipient} bridgeReceiverOverride={bridgeReceiverOverride} chainId={chainId} />,
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

function createRewardsContent(): ContentItem {
  return {
    withTimelineDot: true,
    content: <AffiliateTraderRewardsRow />,
  }
}

export function QuoteSwapContent({ context, hideRecommendedSlippage }: QuoteDetailsContentProps): ReactNode {
  const {
    receiveAmountInfo,
    sellAmount,
    expectedReceive,
    slippage,
    recipient,
    bridgeReceiverOverride,
    minReceiveAmount,
    minReceiveUsdValue,
    expectedReceiveUsdValue,
    isSlippageModified,
  } = context
  const isBridgeQuoteRecipient = recipient === BRIDGE_QUOTE_ACCOUNT
  const isRewardsRowVisible = useIsRewardsRowVisible()
  const contents = [
    createExpectedReceiveContent(expectedReceive, expectedReceiveUsdValue, slippage),
    createSlippageContent(slippage, !!hideRecommendedSlippage, isSlippageModified),
    !isBridgeQuoteRecipient && createRecipientContent(recipient, bridgeReceiverOverride, sellAmount.currency.chainId),
    !isBridgeQuoteRecipient && isRewardsRowVisible && createRewardsContent(),
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
      {!isBridgeQuoteRecipient && (
        <ProxyAccountBanner
          recipient={recipient}
          bridgeReceiverOverride={bridgeReceiverOverride}
          chainId={sellAmount.currency.chainId}
        />
      )}
    </>
  )
}
