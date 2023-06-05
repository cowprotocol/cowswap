// Code based on https://github.com/cowprotocol/explorer/blob/develop/src/components/orders/FilledProgress/index.tsx

import { TokenAmount } from 'common/pure/TokenAmount'
import { getFilledAmounts } from 'utils/orderUtils/getFilledAmounts'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from './styled'

interface Props {
  order: ParsedOrder
}

export function FilledField({ order }: Props) {
  const { executionData } = order
  const { action, mainAmount, formattedFilledAmount, formattedSwappedAmount } = getFilledAmounts(order)

  const touched = executionData.filledPercentage?.gt(0)

  return (
    <styledEl.Value>
      <styledEl.InlineWrapper>
        <styledEl.Progress active={executionData.filledPercentDisplayed || 0} />
      </styledEl.InlineWrapper>

      <styledEl.InlineWrapper>
        <span>
          <b>
            {/* Executed part (bought/sold tokens) */}
            <TokenAmount amount={formattedFilledAmount} tokenSymbol={formattedFilledAmount.currency} />
          </b>{' '}
          {!executionData.fullyFilled && (
            // Show the total amount to buy/sell. Only for orders that are not 100% executed
            <>
              of{' '}
              <b>
                <TokenAmount amount={mainAmount} tokenSymbol={mainAmount?.currency} />
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
              <b>
                <TokenAmount amount={formattedSwappedAmount} tokenSymbol={formattedSwappedAmount.currency} />
              </b>
            </>
          )}
        </span>
      </styledEl.InlineWrapper>
    </styledEl.Value>
  )
}
