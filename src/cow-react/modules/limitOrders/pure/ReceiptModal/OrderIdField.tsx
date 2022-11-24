import * as styledEl from './styled'
import { ExternalLink } from 'theme'
import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { getEtherscanLink } from 'utils'

export type Props = {
  order: ParsedOrder
  chainId: SupportedChainId
}

export function OrderIDField({ order, chainId }: Props) {
  const activityUrl = getEtherscanLink(chainId, order.id, 'transaction')

  return (
    <styledEl.Value>
      <ExternalLink href={activityUrl || ''}>
        <span>{order.id.slice(0, 8)}</span>
        <span>↗</span>
      </ExternalLink>
    </styledEl.Value>
  )
}
