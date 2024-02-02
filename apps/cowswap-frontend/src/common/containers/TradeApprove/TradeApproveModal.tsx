import { useAtom } from 'jotai'

import { Currency } from '@uniswap/sdk-core'

import { tradeApproveStateAtom } from './tradeApproveStateAtom'

import { usePendingApprovalModal } from '../../hooks/usePendingApprovalModal'

export function TradeApproveModal({ currency }: { currency: Currency | undefined }) {
  const currencySymbol = currency?.symbol
  const [, setState] = useAtom(tradeApproveStateAtom)
  const onDismiss = () => setState({ currency, approveInProgress: false })
  const { Modal: PendingApprovalModal } = usePendingApprovalModal(currencySymbol, onDismiss)

  return PendingApprovalModal
}
