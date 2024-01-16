import { getBlockExplorerUrl, getEtherscanLink, getExplorerLabel } from '@cowprotocol/common-utils'

import { Text } from 'rebass'

import { OrderStatus } from 'legacy/state/orders/actions'
import { useOrder } from 'legacy/state/orders/hooks'

import { ExternalLinkCustom } from './styled'

type DisplayLinkProps = {
  id: string | undefined
  chainId: number
}

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

  return (
    <ExternalLinkCustom href={href}>
      <Text fontWeight={500} fontSize={14}>
        {label} ↗
      </Text>
    </ExternalLinkCustom>
  )
}
