import { InfoTooltip, PercentDisplay } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'

import { ReceiveAmountInfo, ReceiveAmountTitle, TradeFeesAndCosts, ConfirmDetailsItem } from 'modules/trade'

import { RecipientDisplay } from '../../RecipientDisplay'
import { TokenAmountDisplay } from '../../TokenAmountDisplay'

interface QuoteDetailsContentProps {
  receiveAmountInfo: ReceiveAmountInfo

  sellCurrencyAmount: CurrencyAmount<Currency>
  buyCurrencyAmount: CurrencyAmount<Currency>

  swapSlippage: Percent
  recipient: string

  swapMinReceiveAmount: CurrencyAmount<Currency>
  swapMinReceiveUsdValue: CurrencyAmount<Token> | null
  swapExpectedReceiveUsdValue: CurrencyAmount<Token> | null
}

export function QuoteSwapContent({
  receiveAmountInfo,
  sellCurrencyAmount,
  buyCurrencyAmount,
  swapSlippage,
  recipient,
  swapMinReceiveAmount,
  swapMinReceiveUsdValue,
  swapExpectedReceiveUsdValue,
}: QuoteDetailsContentProps) {
  const slippagePercentDisplay = <PercentDisplay percent={swapSlippage.toFixed(2)} />

  const contents = [
    {
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
      content: (
        <TokenAmountDisplay displaySymbol currencyAmount={buyCurrencyAmount} usdValue={swapExpectedReceiveUsdValue} />
      ),
    },
    {
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
    },
    {
      label: <ReceiveAmountTitle>Min. to receive</ReceiveAmountTitle>,
      content: (
        <b>
          <TokenAmountDisplay displaySymbol currencyAmount={swapMinReceiveAmount} usdValue={swapMinReceiveUsdValue} />
        </b>
      ),
    },
    {
      withTimelineDot: true,
      label: (
        <>
          Recipient <InfoTooltip content="The address that will receive the tokens." size={14} />
        </>
      ),
      content: <RecipientDisplay recipient={recipient} chainId={sellCurrencyAmount.currency.chainId} />,
    },
  ]

  return (
    <>
      <TradeFeesAndCosts receiveAmountInfo={receiveAmountInfo} />
      {contents.map(({ withTimelineDot, label, content }) => (
        <ConfirmDetailsItem withTimelineDot={withTimelineDot} label={label}>
          {content}
        </ConfirmDetailsItem>
      ))}
    </>
  )
}
