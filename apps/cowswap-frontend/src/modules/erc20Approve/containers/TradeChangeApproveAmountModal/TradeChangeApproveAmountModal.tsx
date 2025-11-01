import { ReactNode } from 'react'

import { useAmountsToSignFromQuote } from 'modules/trade'

import { useGetPartialAmountToSignApprove } from '../../hooks'
import { useSetUserApproveAmountModalState } from '../../state'
import { ChangeApproveAmountModal } from '../ChangeApproveAmountModal'

export function TradeChangeApproveAmountModal(): ReactNode {
  const setUserApproveAmountModalState = useSetUserApproveAmountModalState()
  const initialAmountToApprove = useGetPartialAmountToSignApprove()
  const { maximumSendSellAmount } = useAmountsToSignFromQuote() || {}

  return (
    <ChangeApproveAmountModal
      setUserApproveAmountState={setUserApproveAmountModalState}
      initialAmountToApprove={initialAmountToApprove}
      amountToSwap={maximumSendSellAmount}
    />
  )
}
