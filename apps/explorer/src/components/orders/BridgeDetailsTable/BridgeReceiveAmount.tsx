import React, { ReactNode } from 'react'

import type { CrossChainOrder } from '@cowprotocol/sdk-bridging'
import type { TokenInfo } from '@uniswap/token-lists'

import BigNumber from 'bignumber.js'
import styled from 'styled-components/macro'

import { isNativeToken } from '../../../utils'
import { RowWithCopyButton } from '../../common/RowWithCopyButton'
import { TokenDisplay as CommonTokenDisplay } from '../../common/TokenDisplay'
import { TokenAmount } from '../../token/TokenAmount'

interface BridgeReceiveAmountProps {
  destinationToken: TokenInfo
  amount: bigint
  bridgeProvider: CrossChainOrder['provider']
}

export function BridgeReceiveAmount({ destinationToken, amount, bridgeProvider }: BridgeReceiveAmountProps): ReactNode {
  const isNative = isNativeToken(destinationToken.address)

  const tokenDisplayElement = (
    <CommonTokenDisplay
      erc20={destinationToken}
      network={destinationToken.chainId}
      bridgeProvider={bridgeProvider}
      showNetworkName
    />
  )

  return (
    <BridgeReceiveAmountRoot>
      <span>
        <TokenAmount amount={new BigNumber(amount.toString())} token={destinationToken} noSymbol />{' '}
      </span>
      {isNative ? (
        tokenDisplayElement
      ) : (
        <RowWithCopyButton textToCopy={destinationToken.address} contentsToDisplay={tokenDisplayElement} />
      )}
    </BridgeReceiveAmountRoot>
  )
}

const BridgeReceiveAmountRoot = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`
