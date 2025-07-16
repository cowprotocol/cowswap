import { ReactNode } from 'react'

import { BridgeStatusResult, SupportedChainId } from '@cowprotocol/cow-sdk'

import { ConfirmDetailsItem, ReceiveAmountTitle } from 'modules/trade'

import { AnimatedEllipsis, StatusAwareText } from '../../../../styles'
import { SwapAndBridgeStatus } from '../../../../types'
import { BridgeTransactionLink } from '../../../BridgeTransactionLink'
import { DepositTxLink } from '../../../DepositTxLink'

interface PendingBridgingContentProps {
  sourceChainId: SupportedChainId
  statusResult?: BridgeStatusResult
  explorerUrl?: string
}

export function PendingBridgingContent({
  sourceChainId,
  statusResult,
  explorerUrl,
}: PendingBridgingContentProps): ReactNode {
  const { depositTxHash } = statusResult || {}

  return (
    <>
      <ConfirmDetailsItem
        label={
          <ReceiveAmountTitle>
            <b>You received</b>
          </ReceiveAmountTitle>
        }
      >
        <b>
          <StatusAwareText status={SwapAndBridgeStatus.PENDING}>
            in progress
            <AnimatedEllipsis isVisible />
          </StatusAwareText>
        </b>
      </ConfirmDetailsItem>
      
      {explorerUrl ? (
        <BridgeTransactionLink link={explorerUrl} label="Bridge transaction" />
      ) : (
        <DepositTxLink depositTxHash={depositTxHash} sourceChainId={sourceChainId} />
      )}
    </>
  )
}
