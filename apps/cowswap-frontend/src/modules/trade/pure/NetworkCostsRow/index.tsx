import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { ReviewOrderModalAmountRow } from '../ReviewOrderModalAmountRow'

interface NetworkCostsRowProps {
  networkFeeAmount: CurrencyAmount<Currency>
  networkFeeAmountUsd: CurrencyAmount<Currency> | null
  withTimelineDot?: boolean
  amountSuffix?: ReactNode
  tooltipSuffix?: ReactNode
}
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function NetworkCostsRow({
  withTimelineDot,

  networkFeeAmount,
  networkFeeAmountUsd,
  amountSuffix,
  tooltipSuffix,
}: NetworkCostsRowProps) {
  return (
    <ReviewOrderModalAmountRow
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
