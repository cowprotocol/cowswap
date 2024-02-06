import { Currency } from '@uniswap/sdk-core'

import { usePendingApprovalModal } from '../../hooks/usePendingApprovalModal'
import { useUpdateTradeApproveState } from '../../hooks/useUpdateTradeApproveState'

export function TradeApproveModal({ currency }: { currency: Currency | undefined }) {
  const currencySymbol = currency?.symbol
  const setState = useUpdateTradeApproveState()
  const onDismiss = () => setState({ currency, approveInProgress: false })
  const { Modal: PendingApprovalModal } = usePendingApprovalModal({ currencySymbol, onDismiss })

  return PendingApprovalModal
}
