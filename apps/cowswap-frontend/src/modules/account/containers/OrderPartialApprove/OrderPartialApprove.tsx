import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import {
  ActiveOrdersWithAffectedPermit,
  PendingOrderApproveAmountModal,
  TradeApproveButton,
  TradeApproveToggle,
  useIsPartialApproveSelectedByUser,
  usePendingApproveAmountModalState,
  useUpdatePendingApproveAmountModalState,
} from 'modules/erc20Approve'

import { OrderActionsWrapper } from './styled'

export type OrderPartialApproveProps = {
  amountToApprove: CurrencyAmount<Currency>
  isPartialApproveEnabledBySettings?: boolean
}

export function OrderPartialApprove({
  amountToApprove,
  isPartialApproveEnabledBySettings,
}: OrderPartialApproveProps): ReactNode {
  const isPartialApproveSelectedByUser = useIsPartialApproveSelectedByUser()
  const { isModalOpen, amountSetByUser } = usePendingApproveAmountModalState() || {}
  const updatePendingApproveAmountModalState = useUpdatePendingApproveAmountModalState()

  const amountToApproveFinal = amountSetByUser ?? amountToApprove

  if (isModalOpen) {
    return <PendingOrderApproveAmountModal initialAmountToApprove={amountToApproveFinal} />
  }

  return (
    <OrderActionsWrapper>
      {isPartialApproveEnabledBySettings && (
        <TradeApproveToggle
          amountToApprove={amountToApproveFinal}
          updateModalState={() => updatePendingApproveAmountModalState({ isModalOpen: true })}
        />
      )}
      {isPartialApproveSelectedByUser && <ActiveOrdersWithAffectedPermit currency={amountToApprove.currency} />}
      <TradeApproveButton
        ignorePermit
        enablePartialApprove
        useModals={false}
        amountToApprove={amountToApproveFinal}
        label={'Approve ' + amountToApprove.currency.symbol}
      />
    </OrderActionsWrapper>
  )
}
