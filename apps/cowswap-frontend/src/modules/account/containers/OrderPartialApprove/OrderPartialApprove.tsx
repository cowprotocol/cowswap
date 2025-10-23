import { ReactNode, useMemo } from 'react'

import { ButtonSize } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import {
  ActiveOrdersWithAffectedPermit,
  MAX_APPROVE_AMOUNT,
  PartialApproveAmountModal,
  TradeApproveButton,
  TradeApproveToggle,
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

  const partialAmountToApproveFinal = amountSetByUser ?? amountToApprove
  const currency = partialAmountToApproveFinal.currency

  const maxAmountToApprove = useMemo(() => {
    return CurrencyAmount.fromRawAmount(currency, MAX_APPROVE_AMOUNT.toString())
  }, [currency])

  if (isModalOpen) {
    return <PartialApproveAmountModal initialAmountToApprove={partialAmountToApproveFinal} />
  }

  return (
    <OrderActionsWrapper>
      {isPartialApproveEnabledBySettings && (
        <TradeApproveToggle
          amountToApprove={partialAmountToApproveFinal}
          updateModalState={() => updatePartialApproveAmountModalState({ isModalOpen: true })}
        />
      )}
      <ActiveOrdersWithAffectedPermit orderId={orderId} currency={currency} />
      <TradeApproveButton
        enablePartialApprove
        useModals={false}
        amountToApprove={maxAmountToApprove}
        buttonSize={ButtonSize.SMALL}
        label={'Approve ' + amountToApprove.currency.symbol}
      />
    </OrderActionsWrapper>
  )
}
