import { Currency } from '@uniswap/sdk-core'

import { usePendingApprovalModal } from '../../hooks/usePendingApprovalModal'
import { useUpdateTradeApproveState } from '../../hooks/useUpdateTradeApproveState'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TradeApproveModal({ currency }: { currency: Currency | undefined }) {
  const currencySymbol = currency?.symbol
  const setState = useUpdateTradeApproveState()
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const onDismiss = () => setState({ currency, approveInProgress: false })
  const { Modal: PendingApprovalModal } = usePendingApprovalModal({ currencySymbol, onDismiss })

  return PendingApprovalModal
}
