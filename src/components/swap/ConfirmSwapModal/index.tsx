import { Trans } from '@lingui/macro'

import ConfirmSwapModalMod from './ConfirmSwapModalMod'
import TradeGp from 'state/swap/TradeGp'
import { TokenAmount } from '@cow/common/pure/TokenAmount'

export * from './ConfirmSwapModalMod'

function PendingText(props: { trade: TradeGp | undefined }): JSX.Element {
  const { trade } = props
  const inputAmount = trade?.inputAmount
  const outputAmount = trade?.outputAmount

  return (
    <Trans>
      Swapping <TokenAmount amount={inputAmount} tokenSymbol={inputAmount?.currency} /> for{' '}
      <TokenAmount amount={outputAmount} tokenSymbol={outputAmount?.currency} />
    </Trans>
  )
}

export default function ConfirmSwapModal(
  props: Omit<Parameters<typeof ConfirmSwapModalMod>[0], 'PendingTextComponent'>
) {
  return <ConfirmSwapModalMod {...props} PendingTextComponent={PendingText} />
}
