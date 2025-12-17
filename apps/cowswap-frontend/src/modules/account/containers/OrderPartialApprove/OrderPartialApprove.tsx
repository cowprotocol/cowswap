import { ReactNode, useMemo } from 'react'

import { ButtonSize } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import {
  ActiveOrdersWithAffectedPermit,
  MAX_APPROVE_AMOUNT,
  PartialApproveAmountModal,
  TradeApproveButton,
  TradeApproveToggle,
  useIsPartialApprovalModeSelected,
  usePartialApproveAmountModalState,
  useUpdatePartialApproveAmountModalState,
} from 'modules/erc20Approve'

import { OrderActionsWrapper } from './styled'

export type OrderPartialApproveProps = {
  amountToApprove: CurrencyAmount<Currency>
  isPartialApproveEnabledBySettings?: boolean
  orderId?: string
}

export function OrderPartialApprove({
  amountToApprove,
  isPartialApproveEnabledBySettings,
  orderId,
}: OrderPartialApproveProps): ReactNode {
  const { isModalOpen, amountSetByUser } = usePartialApproveAmountModalState() || {}
  const updatePartialApproveAmountModalState = useUpdatePartialApproveAmountModalState()
  const isPartialApprovalModeSelected = useIsPartialApprovalModeSelected()

  const currency = amountToApprove.currency

  const partialAmountToApproveFinal = amountSetByUser ?? amountToApprove

  const finalAmountToApprove = useMemo(() => {
    if (isPartialApproveEnabledBySettings && isPartialApprovalModeSelected) {
      return partialAmountToApproveFinal
    }

    return CurrencyAmount.fromRawAmount(currency, MAX_APPROVE_AMOUNT.toString())
  }, [isPartialApprovalModeSelected, isPartialApproveEnabledBySettings, partialAmountToApproveFinal, currency])

  if (isModalOpen) {
    return (
      <PartialApproveAmountModal initialAmountToApprove={partialAmountToApproveFinal} amountToSwap={amountToApprove} />
    )
  }

  return (
    <OrderActionsWrapper>
      {/*TODO: it quite similar to <PartialApproveContainer>, should it be reused?*/}
      {isPartialApproveEnabledBySettings && (
        <>
          <TradeApproveToggle
            amountToApprove={finalAmountToApprove}
            updateModalState={() => updatePartialApproveAmountModalState({ isModalOpen: true })}
          />
          <ActiveOrdersWithAffectedPermit orderId={orderId} currency={currency} />
        </>
      )}
      <TradeApproveButton
        enablePartialApprove
        useModals={false}
        amountToApprove={finalAmountToApprove}
        buttonSize={ButtonSize.SMALL}
        label={'Approve ' + currency.symbol}
      />
    </OrderActionsWrapper>
  )
}
