import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { ReviewOrderModalAmountRow } from '../ReviewOrderModalAmountRow'

interface NetworkCostsRowProps {
  networkFeeAmount: CurrencyAmount<Currency>
  networkFeeAmountUsd: CurrencyAmount<Currency> | null
  withTimelineDot?: boolean
  amountSuffix?: ReactNode
  tooltipSuffix?: ReactNode
  alwaysRow?: boolean
}
export function NetworkCostsRow({
  withTimelineDot,
  alwaysRow,
  networkFeeAmount,
  networkFeeAmountUsd,
  amountSuffix,
  tooltipSuffix,
}: NetworkCostsRowProps) {
  return (
    <ReviewOrderModalAmountRow
      alwaysRow={alwaysRow}
      withTimelineDot={withTimelineDot}
      amount={networkFeeAmount}
      fiatAmount={networkFeeAmountUsd}
      amountSuffix={amountSuffix}
      tooltip={
        <>
          This is the cost of settling your order on-chain, including gas and any LP fees.
          <br />
          <br />
          CoW Swap will try to lower this cost where possible.
          {tooltipSuffix}
        </>
      }
      label="Network costs (est.)"
    />
  )
}
