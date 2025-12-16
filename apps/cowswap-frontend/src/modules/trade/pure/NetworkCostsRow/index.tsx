import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans, useLingui } from '@lingui/react/macro'

import { ReviewOrderModalAmountRow } from '../ReviewOrderModalAmountRow'

interface NetworkCostsRowProps {
  networkFeeAmount: CurrencyAmount<Currency>
  networkFeeAmountUsd: CurrencyAmount<Currency> | null
  withTimelineDot?: boolean
  amountSuffix?: ReactNode
  tooltipSuffix?: ReactNode
  isLast?: boolean
}

export function NetworkCostsRow({
  withTimelineDot,
  networkFeeAmount,
  networkFeeAmountUsd,
  amountSuffix,
  tooltipSuffix,
  isLast = false,
}: NetworkCostsRowProps): ReactNode {
  const { t } = useLingui()

  return (
    <ReviewOrderModalAmountRow
      withTimelineDot={withTimelineDot}
      amount={networkFeeAmount}
      fiatAmount={networkFeeAmountUsd}
      amountSuffix={amountSuffix}
      tooltip={
        <>
          <Trans>This is the cost of settling your order on-chain, including gas and any LP fees.</Trans>
          <br />
          <br />
          <Trans>CoW Swap will try to lower this cost where possible.</Trans>
          {tooltipSuffix}
        </>
      }
      label={t`Network costs (est.)`}
      isLast={isLast}
    />
  )
}
