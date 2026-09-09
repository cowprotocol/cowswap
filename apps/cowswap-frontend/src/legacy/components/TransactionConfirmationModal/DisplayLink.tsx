import { ReactNode } from 'react'

import { getChainExplorerLinkTitle, getCoWExplorerLinkTitle, getExplorerOrderLink } from '@cowprotocol/common-utils'

import { OrderStatus } from 'legacy/state/orders/actions'
import { useOrder } from 'legacy/state/orders/hooks'

import { ExternalLinkCustom } from './styled'

type DisplayLinkProps = {
  id: string | undefined
  chainId: number
  leadToBridgeTab: boolean
}

export function DisplayLink({ id, chainId, leadToBridgeTab }: DisplayLinkProps): ReactNode {
  const { orderCreationHash, status } = useOrder({ id, chainId }) || {}

  if (!id || !chainId) {
    return null
  }

  const transactionHash =
    orderCreationHash && (status === OrderStatus.CREATING || status === OrderStatus.FAILED)
      ? orderCreationHash
      : undefined

  if (transactionHash) {
    return <ExternalLinkCustom href={transactionHash}>{getChainExplorerLinkTitle(chainId)} ↗</ExternalLinkCustom>
  }

  return (
    <ExternalLinkCustom href={getExplorerOrderLink(chainId, id) + (leadToBridgeTab ? '?tab=bridge' : '')}>
      {getCoWExplorerLinkTitle()} ↗
    </ExternalLinkCustom>
  )
}
