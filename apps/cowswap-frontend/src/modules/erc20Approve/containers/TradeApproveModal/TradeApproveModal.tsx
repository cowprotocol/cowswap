import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { usePendingApprovalModal } from '../../hooks'
import { useUpdateApproveProgressModalState } from '../../state'

export function TradeApproveModal({
  currency,
  isPendingInProgress,
  amountToApprove,
}: {
  currency?: Currency
  isPendingInProgress?: boolean
  amountToApprove?: CurrencyAmount<Currency>
}): ReactNode {
  const currencySymbol = currency?.symbol
  const setState = useUpdateApproveProgressModalState()
  const onDismiss = (): void =>
    setState({
      currency,
      approveInProgress: false,
      isPendingInProgress: false,
      amountToApprove: undefined,
    })
  const { Modal: PendingApprovalModal } = usePendingApprovalModal({
    currencySymbol,
    onDismiss,
    isPendingInProgress,
    amountToApprove,
  })

  return PendingApprovalModal
}
