import { ReactNode } from 'react'

import { Currency } from '@uniswap/sdk-core'

import { usePendingApprovalModal } from '../../hooks'
import { useUpdateTradeApproveState } from '../../state'

export function TradeApproveModal({ currency }: { currency: Currency | undefined }): ReactNode {
  const currencySymbol = currency?.symbol
  const setState = useUpdateTradeApproveState()
  const onDismiss = (): void => setState({ currency, approveInProgress: false })
  const { Modal: PendingApprovalModal } = usePendingApprovalModal({ currencySymbol, onDismiss })

  return PendingApprovalModal
}
