import React from 'react'

import { RowWithCopyButton } from 'components/common/RowWithCopyButton'

import { RefundStatusText, RefundAddressWrapper } from './styled'

import { AddressLink } from '../../common/AddressLink'

export enum RefundStatusEnum {
  NOT_INITIATED = 'not_initiated',
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
                  <AddressLink address={refundWalletAddress} chainId={refundChainId} showNetworkName />
                </RefundAddressWrapper>
              }
            />
          </RefundStatusText>
        )
      }
      return <RefundStatusText status={status}>Refund completed</RefundStatusText>

    case RefundStatusEnum.NOT_INITIATED:
    default:
      return (
        <RefundStatusText status={status}>
          Refund not yet initiated. Please trigger the refund with your wallet.
        </RefundStatusText>
      )
  }
}
