import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { ReviewOrderModalAmountRow } from '../ReviewOrderModalAmountRow'

interface NetworkCostsRowProps {
  networkFeeAmount: CurrencyAmount<Currency>
  networkFeeAmountUsd: CurrencyAmount<Currency> | null
  withTimelineDot?: boolean
  alwaysRow?: boolean
}
export function NetworkCostsRow({
  withTimelineDot,
  alwaysRow,
  networkFeeAmount,
  networkFeeAmountUsd,
}: NetworkCostsRowProps) {
  return (
    <ReviewOrderModalAmountRow
      alwaysRow={alwaysRow}
      withTimelineDot={withTimelineDot}
      amount={networkFeeAmount}
      fiatAmount={networkFeeAmountUsd}
      tooltip={
        <>
          This is the cost of settling your order on-chain, including gas and any LP fees.
          <br />
          CoW Swap will try to lower this cost where possible.
        </>
      }
      label="Network costs (est.)"
    />
  )
}
