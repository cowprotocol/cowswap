import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { PartialApproveWrapper } from './styled'

import { usePendingApproveAmountModalState, useUpdatePendingApproveAmountModalState } from '../../state'
import { PendingOrderApproveAmountModal } from '../PendingOrderApproveAmountModal'
import { TradeApproveToggle } from '../TradeApproveToggle'

type PartialApproveContainerProps = {
  amountToApprove: CurrencyAmount<Currency>
  className?: string
  children: ReactNode
}

export function PartialApproveContainer({
  amountToApprove,
  className,
  children,
}: PartialApproveContainerProps): ReactNode {
  const { isModalOpen, amountSetByUser } = usePendingApproveAmountModalState() || {}
  const updatePendingApproveAmountModalState = useUpdatePendingApproveAmountModalState()

  const amountToApproveFinal = amountSetByUser ?? amountToApprove

  if (isModalOpen) {
    return <PendingOrderApproveAmountModal initialAmountToApprove={amountToApproveFinal} />
  }

  return (
    <PartialApproveWrapper className={className}>
      <TradeApproveToggle
        amountToApprove={amountToApproveFinal}
        updateModalState={() => updatePendingApproveAmountModalState({ isModalOpen: true })}
      />
      {children}
    </PartialApproveWrapper>
  )
}
