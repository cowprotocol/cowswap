// Code based on https://github.com/cowprotocol/explorer/blob/develop/src/components/orders/FilledProgress/index.tsx
import { useMemo } from 'react'
import * as styledEl from './styled'
import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { formatSmartAmount } from '@cow/utils/format'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { OrderKind } from '@cowprotocol/contracts'
import { BigNumber } from 'bignumber.js'
import JSBI from 'jsbi'
import { TokenSymbol } from '@cow/common/pure/TokenSymbol'

interface Props {
  order: ParsedOrder
  sellAmount: CurrencyAmount<Token>
  buyAmount: CurrencyAmount<Token>
}

export function FilledField({ order, sellAmount, buyAmount }: Props) {
  const {
    inputToken,
    outputToken,
    filledPercentage,
    fullyFilled,
    kind,
    sellToken,
    buyToken,
    feeAmount,
    executedBuyAmount,
    executedSellAmount,
    executedFeeAmount,
    filledAmount,
  } = order

  const touched = !!filledPercentage?.gt(0)

  let mainToken: Token
  let mainAddress: string
  let mainAmount: CurrencyAmount<Token>
  let swappedToken: Token
  let swappedAddress: string
  let swappedAmount: JSBI | undefined
  let action: string

  let filledAmountWithFee, swappedAmountWithFee
  if (kind === OrderKind.SELL) {
    action = 'sold'

    mainToken = inputToken
    mainAddress = sellToken
    mainAmount = sellAmount.add(CurrencyAmount.fromRawAmount(mainToken, feeAmount.toString()))

    swappedToken = outputToken
    swappedAddress = buyToken
    swappedAmount = executedBuyAmount

    // Sell orders, add the fee in to the sellAmount (mainAmount, in this case)
    filledAmountWithFee = filledAmount?.plus(executedFeeAmount || '0')
    swappedAmountWithFee = new BigNumber(swappedAmount?.toString() || '0')
  } else {
    action = 'bought'

    mainToken = outputToken
    mainAddress = buyToken
    mainAmount = buyAmount

    swappedToken = inputToken
    swappedAddress = sellToken
    swappedAmount = executedSellAmount

    // Buy orders need to add the fee, to the sellToken too (swappedAmount in this case)
    filledAmountWithFee = filledAmount
    swappedAmountWithFee = new BigNumber(swappedAmount?.toString() || '0').plus(executedFeeAmount || '0')
  }

  // In case the token object is empty, display the address
  const mainSymbol = mainToken ? mainToken.symbol : mainAddress
  const swappedSymbol = swappedToken ? swappedToken.symbol : swappedAddress
  // In case the token object is empty, display the raw amount (`decimals || 0` part)

  const formattedMainAmount = formatSmartAmount(mainAmount)
  const filledAmountDecimal = filledAmountWithFee?.div(new BigNumber(10 ** mainToken.decimals))
  const formattedFilledAmount = formatSmartAmount(filledAmountDecimal)

  const swappedAmountDecimal = swappedAmountWithFee?.div(new BigNumber(10 ** swappedToken.decimals))
  const formattedSwappedAmount = formatSmartAmount(swappedAmountDecimal)

  const formattedPercentage = useMemo(() => {
    if (!filledPercentage) {
      return null
    }

    return filledPercentage.times('100').decimalPlaces(2).toString()
  }, [filledPercentage])

  return (
    <styledEl.Value>
      <styledEl.InlineWrapper>
        <styledEl.Progress active={formattedPercentage || 0} />
      </styledEl.InlineWrapper>

      <styledEl.InlineWrapper>
        <span>
          <b title={filledAmountDecimal?.toString() + ' ' + mainSymbol}>
            {/* Executed part (bought/sold tokens) */}
            {formattedFilledAmount} <TokenSymbol token={{ symbol: mainSymbol }} />
          </b>{' '}
          {!fullyFilled && (
            // Show the total amount to buy/sell. Only for orders that are not 100% executed
            <>
              of{' '}
              <b title={mainAmount.toExact() + ' ' + mainSymbol}>
                {formattedMainAmount} <TokenSymbol token={{ symbol: mainSymbol }} />
              </b>{' '}
            </>
          )}
          {action}{' '}
          {touched && (
            // Executed part of the trade:
            //    Total buy tokens you receive (for sell orders)
            //    Total sell tokens you pay (for buy orders)
            <>
              for a total of{' '}
              <b title={swappedAmountDecimal.toString() + ' ' + swappedSymbol}>
                {formattedSwappedAmount} <TokenSymbol token={{ symbol: swappedSymbol }} />
              </b>
            </>
          )}
        </span>
      </styledEl.InlineWrapper>
    </styledEl.Value>
  )
}
