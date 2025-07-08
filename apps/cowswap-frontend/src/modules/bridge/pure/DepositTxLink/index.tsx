import { ReactNode } from 'react'

import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { TransactionLinkItem } from '../TransactionLink'

interface DepositTxLinkProps {
  sourceChainId: SupportedChainId
  depositTxHash: string | undefined
}

export function DepositTxLink({ depositTxHash, sourceChainId }: DepositTxLinkProps): ReactNode {
  const depositLink = depositTxHash && getExplorerLink(sourceChainId, depositTxHash, ExplorerDataType.TRANSACTION)

  if (!depositLink) return null

  return <TransactionLinkItem link={depositLink} label="Source transaction" chainId={sourceChainId} />
}
