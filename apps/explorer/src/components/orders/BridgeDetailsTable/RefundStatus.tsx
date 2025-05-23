import React from 'react'

import { BridgeStatus } from '@cowprotocol/bridge'
import { getChainInfo } from '@cowprotocol/common-const'
import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { NetworkLogo } from '@cowprotocol/ui'

import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { StatusLabel } from 'components/orders/StatusLabel'

import { NetworkName, RefundStatusText, RefundAddressWrapper, StatusWrapper } from './styled'

export enum RefundStatusEnum {
  NOT_INITIATED = 'not_initiated',
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export type RefundStatusType = RefundStatusEnum

export interface RefundStatusProps {
  status: RefundStatusType
  refundWalletAddress?: string
  refundChainId?: number
}

export function RefundStatus({ status, refundWalletAddress, refundChainId }: RefundStatusProps): React.ReactNode {
  switch (status) {
    case RefundStatusEnum.COMPLETED:
      if (refundWalletAddress && refundChainId) {
        return (
          <RefundStatusText status={status}>
            Refunded to{' '}
            <RowWithCopyButton
              textToCopy={refundWalletAddress}
              contentsToDisplay={
                <RefundAddressWrapper>
                  <LinkWithPrefixNetwork
                    to={getExplorerLink(refundChainId, refundWalletAddress, ExplorerDataType.ADDRESS)}
                    target="_blank"
                  >
                    <NetworkLogo chainId={refundChainId} size={16} forceLightMode />
                    {refundWalletAddress} ↗
                  </LinkWithPrefixNetwork>
                  <NetworkName>on {getChainInfo(refundChainId).label}</NetworkName>
                </RefundAddressWrapper>
              }
            />
          </RefundStatusText>
        )
      }
      return <RefundStatusText status={status}>Refund completed</RefundStatusText>

    case RefundStatusEnum.PENDING:
      return (
        <StatusWrapper>
          <StatusLabel status={BridgeStatus.Pending} />
          <span>Refund started</span>
        </StatusWrapper>
      )

    case RefundStatusEnum.FAILED:
      return (
        <StatusWrapper>
          <StatusLabel status={BridgeStatus.Failed} />
          <span>Refund failed</span>
        </StatusWrapper>
      )

    case RefundStatusEnum.NOT_INITIATED:
    default:
      return (
        <RefundStatusText status={status}>
          Refund not yet initiated. Please trigger the refund with your wallet.
        </RefundStatusText>
      )
  }
}
