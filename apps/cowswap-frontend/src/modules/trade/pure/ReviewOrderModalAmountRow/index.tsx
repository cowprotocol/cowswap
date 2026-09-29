import { ReactElement, ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { TEST_IDS } from '@cowprotocol/test-ids'
import { CenteredDots, FiatAmount, InfoTooltip, TokenAmount } from '@cowprotocol/ui'

import { Nullish } from 'types'

import { Content, Label } from 'modules/trade/pure/ConfirmDetailsItem/styled'

import { ConfirmDetailsItem } from '../ConfirmDetailsItem'
import { ReceiveAmountTitle } from '../ReceiveAmountTitle'

export type ReviewOrderAmountRowProps = {
  amount?: Nullish<CurrencyAmount<Currency>>
  fiatAmount?: Nullish<CurrencyAmount<Currency>>
  tooltip?: ReactNode
  label: ReactNode
  children?: ReactNode
  amountSuffix?: ReactNode
  isAmountAccurate?: boolean
  withTimelineDot?: boolean
  highlighted?: boolean
  isLast?: boolean
  loading?: boolean
  /** Overrides the default `confirmOrderAmount` test hook — e.g. for a row reused in a surface (the bridge route panel) that can render alongside the plain Confirm modal these rows normally tag. */
  testId?: string
}

export function ReviewOrderModalAmountRow({
  amount,
  fiatAmount,
  tooltip,
  label,
  children,
  amountSuffix,
  isAmountAccurate = true,
  withTimelineDot = false,
  highlighted = false,
  isLast = false,
  loading = false,
  testId = TEST_IDS.confirmOrderAmount,
}: ReviewOrderAmountRowProps): ReactElement {
  const Amount = loading ? (
    <CenteredDots />
  ) : (
    <Content highlighted={highlighted}>
      {children}
      {!isAmountAccurate && '≈ '}
      <TokenAmount amount={amount} defaultValue="-" tokenSymbol={amount?.currency} />
      {amountSuffix}
      {fiatAmount && (
        <>
          &nbsp;
          <FiatAmount amount={fiatAmount} withParentheses />
        </>
      )}
    </Content>
  )

  return (
    <ConfirmDetailsItem
      testId={testId}
      tooltip={tooltip}
      label={highlighted ? undefined : label}
      withTimelineDot={withTimelineDot}
      isLast={isLast}
    >
      {highlighted ? (
        <>
          <ReceiveAmountTitle>
            <Label>
              <b>
                {label} {tooltip && <InfoTooltip className="info-tooltip" content={tooltip} />}
              </b>
            </Label>
          </ReceiveAmountTitle>
          <span>{Amount}</span>
        </>
      ) : (
        Amount
      )}
    </ConfirmDetailsItem>
  )
}
