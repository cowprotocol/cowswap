import React, { ReactNode } from 'react'

import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { CrossChainOrder } from '@cowprotocol/cow-sdk'

import { LinkWithPrefixNetwork } from '../../common/LinkWithPrefixNetwork'
import { RowWithCopyButton } from '../../common/RowWithCopyButton'

interface TransactionDetailsDisplayProps {
  crossChainOrder: CrossChainOrder
}

export function BridgeTxOverview({ crossChainOrder }: TransactionDetailsDisplayProps): ReactNode {
  const { explorerUrl, statusResult } = crossChainOrder

  if (explorerUrl) {
    return (
      <RowWithCopyButton
        textToCopy={explorerUrl}
        contentsToDisplay={
          <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
            View on bridge explorer ↗
          </a>
        }
      />
    )
  }

  const txHash = statusResult.fillTxHash || statusResult.depositTxHash
  const chainIdForLink = statusResult.fillTxHash
    ? crossChainOrder.bridgingParams.destinationChainId
    : crossChainOrder.bridgingParams.sourceChainId

  if (!txHash || !chainIdForLink) return null

  const explorerPath = getExplorerLink(chainIdForLink, txHash, ExplorerDataType.TRANSACTION)

  return (
    <RowWithCopyButton
      textToCopy={txHash}
      contentsToDisplay={
        <LinkWithPrefixNetwork to={explorerPath} target="_blank">
          {txHash} ↗
        </LinkWithPrefixNetwork>
      }
    />
  )
}
