import { InfoTooltip, PercentDisplay } from '@cowprotocol/ui'

import { ReceiveAmountTitle, TradeFeesAndCosts, ConfirmDetailsItem } from 'modules/trade'

import { QuoteSwapContext } from '../../../types'
import { RecipientDisplay } from '../../RecipientDisplay'
import { TokenAmountDisplay } from '../../TokenAmountDisplay'

interface QuoteDetailsContentProps {
  context: QuoteSwapContext
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
}: QuoteDetailsContentProps) {
  const slippagePercentDisplay = <PercentDisplay percent={slippage.toFixed(2)} />

  const contents = [
    {
      withTimelineDot: true,
      label: (
        <>
          Expected to receive{' '}
          <InfoTooltip
            content={
              <>
                The estimated amount you will receive after estimated network costs and the max slippage setting (
                {slippagePercentDisplay}).
              </>
            }
            size={14}
          />
        </>
      ),
      content: <TokenAmountDisplay displaySymbol currencyAmount={buyAmount} usdValue={expectedReceiveUsdValue} />,
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
    },
    {
      withTimelineDot: true,
      label: (
        <>
          Recipient <InfoTooltip content="The address that will receive the tokens." size={14} />
        </>
      ),
      content: <RecipientDisplay recipient={recipient} chainId={sellAmount.currency.chainId} />,
    },
  ]

  return (
    <>
      <TradeFeesAndCosts receiveAmountInfo={receiveAmountInfo} />
      {contents.map(({ withTimelineDot, label, content }, index) => (
        <ConfirmDetailsItem key={index} withTimelineDot={withTimelineDot} label={label}>
          {content}
        </ConfirmDetailsItem>
      ))}
    </>
  )
}
