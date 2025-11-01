import { ReactNode, useMemo } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { PartialApproveWrapper } from './styled'

import { MAX_APPROVE_AMOUNT } from '../../constants'
import { useIsPartialApprovalModeSelected } from '../../hooks'
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
  const isPartialApprovalModeSelected = useIsPartialApprovalModeSelected()

  const currency = amountToApprove.currency

  const partialAmountToApproveFinal = amountSetByUser ?? amountToApprove

  const finalAmountToApprove = useMemo(() => {
    if (isPartialApprovalModeSelected) {
      return partialAmountToApproveFinal
    }

    return CurrencyAmount.fromRawAmount(currency, MAX_APPROVE_AMOUNT.toString())
  }, [isPartialApprovalModeSelected, partialAmountToApproveFinal, currency])

  if (isModalOpen) {
    return <PartialApproveAmountModal initialAmountToApprove={amountToApprove} amountToSwap={amountToApprove} />
  }

  return (
    <PartialApproveWrapper className={className}>
      <TradeApproveToggle
        amountToApprove={finalAmountToApprove}
        updateModalState={() => updatePartialApproveAmountModalState({ isModalOpen: true })}
      />
      {children}
    </PartialApproveWrapper>
  )
}
