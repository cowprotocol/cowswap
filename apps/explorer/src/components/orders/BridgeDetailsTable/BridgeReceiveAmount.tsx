import React, { ReactNode } from 'react'

import type { TokenInfo } from '@uniswap/token-lists'

import BigNumber from 'bignumber.js'

import { isNativeToken } from '../../../utils'
import { RowWithCopyButton } from '../../common/RowWithCopyButton'
import { TokenDisplay as CommonTokenDisplay } from '../../common/TokenDisplay'
import { TokenAmount } from '../../token/TokenAmount'

interface BridgeReceiveAmountProps {
  destinationToken: TokenInfo
  amount: bigint
}

export function BridgeReceiveAmount({ destinationToken, amount }: BridgeReceiveAmountProps): ReactNode {
  const isNative = isNativeToken(destinationToken.address)

  const tokenDisplayElement = (
    <CommonTokenDisplay erc20={destinationToken} network={destinationToken.chainId} showNetworkName={true} />
  )

  return (
    <span>
      <span>
        <TokenAmount amount={new BigNumber(amount.toString())} token={destinationToken} noSymbol />{' '}
      </span>
      {isNative ? (
        tokenDisplayElement
      ) : (
        <RowWithCopyButton textToCopy={destinationToken.address} contentsToDisplay={tokenDisplayElement} />
      )}
    </span>
  )
}
