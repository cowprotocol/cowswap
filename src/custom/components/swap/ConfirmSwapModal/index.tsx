import React from 'react'
import { Trans } from '@lingui/macro'

import ConfirmSwapModalMod from './ConfirmSwapModalMod'
import TradeGp from 'state/swap/TradeGp'
import { formatSmart } from 'utils/format'

export * from './ConfirmSwapModalMod'

function PendingText(props: { trade: TradeGp | undefined }): JSX.Element {
  const { trade } = props
  const inputAmount = trade?.inputAmount
  const inputSymbol = inputAmount?.currency?.symbol
  const outputAmount = trade?.outputAmount
  const outputSymbol = outputAmount?.currency?.symbol

  return (
    <Trans>
      Swapping{' '}
      <span title={`${inputAmount?.toFixed(inputAmount?.currency.decimals)} ${inputSymbol}`}>
        {formatSmart(inputAmount)} {inputSymbol}
      </span>{' '}
      for{' '}
      <span title={`${outputAmount?.toFixed(outputAmount?.currency.decimals)} ${outputSymbol}`}>
        {formatSmart(outputAmount)} {outputSymbol}
      </span>
    </Trans>
  )
}

export default function ConfirmSwapModal(
  props: Omit<Parameters<typeof ConfirmSwapModalMod>[0], 'PendingTextComponent'>
) {
  return <ConfirmSwapModalMod {...props} PendingTextComponent={PendingText} />
}
