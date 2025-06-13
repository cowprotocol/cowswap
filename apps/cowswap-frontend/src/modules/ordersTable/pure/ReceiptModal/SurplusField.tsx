import { isSellOrder } from '@cowprotocol/common-utils'
import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from './styled'

interface Props {
  order: ParsedOrder
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SurplusField({ order }: Props) {
  const { kind, inputToken, outputToken } = order
  const { surplusAmount, surplusPercentage } = order.executionData

  const surplusToken = isSellOrder(kind) ? outputToken : inputToken

  if (!surplusToken || !surplusAmount || surplusAmount?.isZero()) {
    return <styledEl.Value>-</styledEl.Value>
  }

  const parsedSurplus = CurrencyAmount.fromRawAmount(surplusToken, surplusAmount?.decimalPlaces(0).toFixed())
  const formattedPercent = surplusPercentage?.multipliedBy(100)?.toFixed(2)

  return (
    <styledEl.Value title={`${parsedSurplus.toExact()} ${surplusToken.symbol}`}>
      <styledEl.InlineWrapper>
        <styledEl.Surplus>+{formattedPercent}%</styledEl.Surplus>
        <span>
          <TokenAmount amount={parsedSurplus} tokenSymbol={surplusToken} />
        </span>
      </styledEl.InlineWrapper>
    </styledEl.Value>
  )
}
