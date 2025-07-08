import { ReactNode } from 'react'

import { BridgeStatusResult, SupportedChainId } from '@cowprotocol/cow-sdk'

import { ConfirmDetailsItem, ReceiveAmountTitle } from 'modules/trade'

import { AnimatedEllipsis, StatusAwareText } from '../../../../styles'
import { SwapAndBridgeStatus } from '../../../../types'
import { DepositTxLink } from '../../../DepositTxLink'

interface PendingBridgingContentProps {
  sourceChainId: SupportedChainId
  statusResult?: BridgeStatusResult
}

export function PendingBridgingContent({ sourceChainId, statusResult }: PendingBridgingContentProps): ReactNode {
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

      <DepositTxLink depositTxHash={depositTxHash} sourceChainId={sourceChainId} />
    </>
  )
}
