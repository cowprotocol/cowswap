import { Trans } from '@lingui/macro'

import ConfirmSwapModalMod from './ConfirmSwapModalMod'
import TradeGp from 'state/swap/TradeGp'
import { formatMax, formatSmart } from '@cow/utils/format'
import { AMOUNT_PRECISION } from 'constants/index'

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
      <span title={`${formatMax(inputAmount, inputAmount?.currency.decimals)} ${inputSymbol}`}>
        {formatSmart(inputAmount, AMOUNT_PRECISION)} {inputSymbol}
      </span>{' '}
      for{' '}
      <span title={`${formatMax(outputAmount, outputAmount?.currency.decimals)} ${outputSymbol}`}>
        {formatSmart(outputAmount, AMOUNT_PRECISION)} {outputSymbol}
      </span>
    </Trans>
  )
}

export default function ConfirmSwapModal(
  props: Omit<Parameters<typeof ConfirmSwapModalMod>[0], 'PendingTextComponent'>
) {
  return <ConfirmSwapModalMod {...props} PendingTextComponent={PendingText} />
}
