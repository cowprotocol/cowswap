import React from 'react'

import type { TokenInfo } from '@uniswap/token-lists'

import BigNumber from 'bignumber.js'

import { formatTokenAmount } from '../../../utils/tokenFormatting'
import { RowWithCopyButton } from '../../common/RowWithCopyButton'
import { TokenDisplay as CommonTokenDisplay } from '../../common/TokenDisplay'



interface BridgeReceiveAmountProps {
  destinationToken: TokenInfo
  amount: bigint
}

export function BridgeReceiveAmount({destinationToken, amount}: BridgeReceiveAmountProps) {
  const { formattedAmount, isNative } = formatTokenAmount(new BigNumber(amount.toString()), destinationToken)

  const tokenDisplayElement = (
    <CommonTokenDisplay
      erc20={destinationToken}
      network={destinationToken.chainId}
      showNetworkName={true}
    />
  )

  return (
    <span>
        <span>{formattedAmount} </span>
      {isNative ? (
        tokenDisplayElement
      ) : (
        <RowWithCopyButton textToCopy={destinationToken.address} contentsToDisplay={tokenDisplayElement} />
      )}
      </span>
  )
}
