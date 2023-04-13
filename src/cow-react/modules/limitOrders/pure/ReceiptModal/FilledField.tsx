// Code based on https://github.com/cowprotocol/explorer/blob/develop/src/components/orders/FilledProgress/index.tsx
import * as styledEl from './styled'
import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { TokenAmount } from '@cow/common/pure/TokenAmount'
import { getFilledAmounts } from '@cow/modules/limitOrders/utils/getFilledAmounts'

interface Props {
  order: ParsedOrder
}

export function FilledField({ order }: Props) {
  const { filledPercentage, formattedPercentage, fullyFilled } = order
  const { action, mainAmount, formattedFilledAmount, formattedSwappedAmount } = getFilledAmounts(order)

  const touched = filledPercentage?.gt(0)

  return (
    <styledEl.Value>
      <styledEl.InlineWrapper>
        <styledEl.Progress active={formattedPercentage || 0} />
      </styledEl.InlineWrapper>

      <styledEl.InlineWrapper>
        <span>
          <b>
            {/* Executed part (bought/sold tokens) */}
            <TokenAmount amount={formattedFilledAmount} tokenSymbol={formattedFilledAmount.currency} />
          </b>{' '}
          {!fullyFilled && (
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
