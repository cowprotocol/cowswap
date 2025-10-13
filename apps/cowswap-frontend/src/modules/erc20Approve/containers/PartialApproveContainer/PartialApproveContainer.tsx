import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { PartialApproveWrapper } from './styled'

import { usePartialApproveAmountModalState, useUpdatePartialApproveAmountModalState } from '../../state'
import { PartialApproveAmountModal } from '../PartialApproveAmountModal'
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
  const { isModalOpen, amountSetByUser } = usePartialApproveAmountModalState() || {}
  const updatePartialApproveAmountModalState = useUpdatePartialApproveAmountModalState()

  const amountToApproveFinal = amountSetByUser ?? amountToApprove

  if (isModalOpen) {
    return <PartialApproveAmountModal initialAmountToApprove={amountToApproveFinal} />
  }

  return (
    <PartialApproveWrapper className={className}>
      <TradeApproveToggle
        amountToApprove={amountToApproveFinal}
        updateModalState={() => updatePartialApproveAmountModalState({ isModalOpen: true })}
      />
      {children}
    </PartialApproveWrapper>
  )
}
