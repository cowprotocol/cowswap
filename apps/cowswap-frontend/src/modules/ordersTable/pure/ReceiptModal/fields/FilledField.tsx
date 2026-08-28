import { ReactNode } from 'react'

import { PercentDisplay, TokenAmount } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { getFilledAmounts } from 'utils/orderUtils/getFilledAmounts'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { FieldLabel } from './FieldLabel'

import * as styledEl from '../ReceiptModal.styled'

interface FilledFieldProps {
  order: ParsedOrder
}

export function FilledField({ order }: FilledFieldProps): ReactNode {
  const {
    executionData: { filledPercentage, filledPercentDisplay, fullyFilled },
  } = order
  const { action, mainAmount, formattedFilledAmount, formattedSwappedAmount } = getFilledAmounts(order)

  const touched = filledPercentage?.gt(0)
  const hasFill = !!touched
  const fillPercentage = clampPercentage(Number(filledPercentDisplay))

  if (!hasFill) {
    return (
      <styledEl.FillOutcome>
        <styledEl.FillHeading>
          <FieldLabel label={t`Fill outcome`} />
          <styledEl.FillStatus>
            <Trans>Not filled</Trans>
          </styledEl.FillStatus>
        </styledEl.FillHeading>
      </styledEl.FillOutcome>
    )
  }

  return (
    <styledEl.FillOutcome>
      <styledEl.FillHeading>
        <FieldLabel label={t`Fill outcome`} />
        <styledEl.FillPercentage $hasFill={hasFill}>
          <PercentDisplay percent={filledPercentDisplay} />
        </styledEl.FillPercentage>
      </styledEl.FillHeading>

      <styledEl.ProgressTrack
        $hasFill={hasFill}
        role="progressbar"
        aria-label={t`Filled`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={fillPercentage}
      >
        <styledEl.Progress $value={fillPercentage} />
      </styledEl.ProgressTrack>

      <styledEl.FillDescription>
        <TokenAmount amount={formattedFilledAmount} tokenSymbol={formattedFilledAmount.currency} />{' '}
        {!fullyFilled ? (
          <>
            <Trans>of</Trans> <TokenAmount amount={mainAmount} tokenSymbol={mainAmount.currency} />{' '}
          </>
        ) : null}
        {action}{' '}
        {touched ? (
          <>
            <Trans>for</Trans>{' '}
            <TokenAmount amount={formattedSwappedAmount} tokenSymbol={formattedSwappedAmount.currency} />
          </>
        ) : null}
      </styledEl.FillDescription>
    </styledEl.FillOutcome>
  )
}

function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) return 0

  return Math.min(100, Math.max(0, value))
}
