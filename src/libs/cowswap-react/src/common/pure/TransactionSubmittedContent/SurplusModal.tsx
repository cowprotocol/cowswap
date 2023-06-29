import { OrderKind } from '@cowprotocol/cow-sdk'

import { Order } from 'legacy/state/orders/actions'
import { ExternalLink } from 'legacy/theme'

import { useGetSurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { FiatAmount } from 'common/pure/FiatAmount'
import { TokenAmount } from 'common/pure/TokenAmount'

const SELL_SURPLUS_WORD = 'got'
const BUY_SURPLUS_WORD = 'saved'

export type SurplusModalProps = {
  order: Order | undefined
}

export function SurplusModal(props: SurplusModalProps) {
  const { order } = props

  const { surplusFiatValue, showFiatValue, surplusToken, surplusAmount } = useGetSurplusData(order)

  if (!order) {
    return null
  }

  const surplusMsg = `You ${order.kind === OrderKind.SELL ? SELL_SURPLUS_WORD : BUY_SURPLUS_WORD} an extra`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>Swap completed</h2>
      {/* TODO: add image */}
      <span>--nice image here--</span>
      <span>Great! {surplusMsg}</span>
      <strong>
        <TokenAmount amount={surplusAmount} tokenSymbol={surplusToken} />!
      </strong>
      {showFiatValue && <FiatAmount amount={surplusFiatValue} accurate={false} />}
      {/* TODO: add twitter button with styles */}
      {/* TODO: add share data */}
      <ExternalLink href="https://cow.fi">Share this win!</ExternalLink>
      {/* TODO: add proper link */}
      <span>
        CoW Swap is the only token exchange that gets you extra tokens.{' '}
        <ExternalLink href={'https://cow.fi'}>Learn how ↗</ExternalLink>
      </span>
    </div>
  )
}
