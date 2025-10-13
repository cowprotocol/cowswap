import { ReactNode } from 'react'

import { Currency } from '@uniswap/sdk-core'

import { usePendingApprovalModal } from '../../hooks'
import { useUpdateTradeApproveState } from '../../state'

export function TradeApproveModal({
  currency,
  isPendingInProgress,
}: {
  currency: Currency | undefined
  isPendingInProgress: boolean | undefined
}): ReactNode {
  const currencySymbol = currency?.symbol
  const setState = useUpdateTradeApproveState()
  const onDismiss = (): void => setState({ currency, approveInProgress: false, isPendingInProgress: false })
  const { Modal: PendingApprovalModal } = usePendingApprovalModal({ currencySymbol, onDismiss, isPendingInProgress })

  return PendingApprovalModal
}
