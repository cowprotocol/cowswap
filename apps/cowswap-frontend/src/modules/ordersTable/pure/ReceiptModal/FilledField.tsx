import { PercentDisplay, TokenAmount } from '@cowprotocol/ui'

import { getFilledAmounts } from 'utils/orderUtils/getFilledAmounts'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from './styled'

import { ProgressBar, ProgressBarWrapper } from '../../containers/OrderRow/styled'

interface Props {
  order: ParsedOrder
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function FilledField({ order }: Props) {
  const {
    executionData: { filledPercentage, filledPercentDisplay, fullyFilled },
  } = order
  const { action, mainAmount, formattedFilledAmount, formattedSwappedAmount } = getFilledAmounts(order)

  const touched = filledPercentage?.gt(0)

  return (
    <styledEl.Value>
      <styledEl.InlineWrapper>
        <ProgressBarWrapper>
          <ProgressBar value={filledPercentDisplay}></ProgressBar>
          <b>
            <PercentDisplay percent={filledPercentDisplay} />
          </b>
        </ProgressBarWrapper>
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
