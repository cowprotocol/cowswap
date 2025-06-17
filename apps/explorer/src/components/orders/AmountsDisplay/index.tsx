import React from 'react'

import { isSellOrder } from '@cowprotocol/common-utils'

import { useNetworkId } from 'state/network'

import { Order } from 'api/operator'

import { AmountRow } from './AmountRow'
import { Wrapper } from './styled'

export type Props = { order: Order }

export function AmountsDisplay(props: Props): React.ReactNode | null {
  const { order } = props
  const { kind, buyAmount, buyToken, sellAmount, feeAmount, sellToken } = order
  const network = useNetworkId()

  const isSell = isSellOrder(kind)
  const isBridging = !!order?.bridgeProviderId

  const fromAmount = sellAmount.plus(feeAmount)

  if (!buyToken || !sellToken || !network) {
    return null
  }

  return (
    <Wrapper>
      <AmountRow
        title="From"
        titleSuffix={isSell ? '' : 'at most'}
        amount={fromAmount}
        erc20={sellToken}
        network={network}
        isBridging={isBridging}
      />
      <AmountRow
        title="To"
        titleSuffix={isSell ? 'at least' : ''}
        amount={buyAmount}
        erc20={buyToken}
        network={network}
        isBridging={isBridging}
      />
    </Wrapper>
  )
}
