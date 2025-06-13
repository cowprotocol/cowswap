import { getBlockExplorerUrl, getEtherscanLink, getExplorerLabel } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'

import { OrderStatus } from 'legacy/state/orders/actions'
import { useOrder } from 'legacy/state/orders/hooks'

import { ExternalLinkCustom } from './styled'

type DisplayLinkProps = {
  id: string | undefined
  chainId: number
  onClick?: Command
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function DisplayLink({ id, chainId }: DisplayLinkProps) {
  const { orderCreationHash, status } = useOrder({ id, chainId }) || {}

  if (!id || !chainId) {
    return null
  }

  const ethFlowHash =
    orderCreationHash && (status === OrderStatus.CREATING || status === OrderStatus.FAILED)
      ? orderCreationHash
      : undefined
  const href = ethFlowHash
    ? getBlockExplorerUrl(chainId, 'transaction', ethFlowHash)
    : getEtherscanLink(chainId, 'transaction', id)
  const label = getExplorerLabel(chainId, 'transaction', ethFlowHash || id)

  return <ExternalLinkCustom href={href}>{label} ↗</ExternalLinkCustom>
}
