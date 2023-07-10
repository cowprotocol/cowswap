import React, { useContext } from 'react'

import { Text } from 'rebass'
import { ThemeContext } from 'styled-components/macro'

import { OrderStatus } from 'legacy/state/orders/actions'
import { useOrder } from 'legacy/state/orders/hooks'
import { getBlockExplorerUrl, getEtherscanLink, getExplorerLabel } from 'legacy/utils'

import { ExternalLinkCustom } from './styled'

type DisplayLinkProps = {
  id: string | undefined
  chainId: number
}

export function DisplayLink({ id, chainId }: DisplayLinkProps) {
  const theme = useContext(ThemeContext)
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
      <Text fontWeight={500} fontSize={14} color={theme.text3}>
        {label} ↗
      </Text>
    </ExternalLinkCustom>
  )
}
