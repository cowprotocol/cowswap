import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { Trans, useLingui } from '@lingui/react/macro'
import { Nullish } from 'types'

import { ReviewOrderModalAmountRow } from '../ReviewOrderModalAmountRow'

interface AccountRentRowProps {
  rentAmount: CurrencyAmount<Currency>
  rentAmountUsd: Nullish<CurrencyAmount<Currency>>
  buyTokenSymbol: string | undefined
  withTimelineDot?: boolean
  isLast?: boolean
  testId?: string
}

export function AccountRentRow({
  rentAmount,
  rentAmountUsd,
  buyTokenSymbol,
  withTimelineDot,
  isLast = false,
  testId,
}: AccountRentRowProps): ReactNode {
  const { t } = useLingui()
  const tokenLabel = buyTokenSymbol || t`token`

  return (
    <ReviewOrderModalAmountRow
      withTimelineDot={withTimelineDot}
      amount={rentAmount}
      fiatAmount={rentAmountUsd}
      tooltip={
        <>
          <Trans>
            Solana charges a one-time deposit to open your {tokenLabel} account, which is taken out of this trade.
          </Trans>
          <br />
          <br />
          <Trans>The deposit stays yours: closing the account once it is empty returns it to you as SOL.</Trans>
        </>
      }
      label={t`Account deposit`}
      isLast={isLast}
      testId={testId}
    />
  )
}
