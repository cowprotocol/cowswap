import { ReactNode } from 'react'

import { ButtonSize } from '@cowprotocol/ui'
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
}

export function OrderPartialApprove({ amountToApprove }: OrderPartialApproveProps): ReactNode {
  const isPartialApproveSelectedByUser = useIsPartialApproveSelectedByUser()
  const { isModalOpen, amountSetByUser } = usePendingApproveAmountModalState() || {}
  const updatePendingApproveAmountModalState = useUpdatePendingApproveAmountModalState()

  const amountToApproveFinal = amountSetByUser ?? amountToApprove

  if (isModalOpen) {
    return <PendingOrderApproveAmountModal initialAmountToApprove={amountToApproveFinal} />
  }

  return (
    <OrderActionsWrapper>
      <TradeApproveToggle
        amountToApprove={amountToApproveFinal}
        updateModalState={() => updatePendingApproveAmountModalState({ isModalOpen: true })}
      />
      {isPartialApproveSelectedByUser && <ActiveOrdersWithAffectedPermit currency={amountToApprove.currency} />}
      <TradeApproveButton
        ignorePermit
        enablePartialApprove
        amountToApprove={amountToApproveFinal}
        buttonSize={ButtonSize.DEFAULT}
        label={'Approve ' + amountToApprove.currency.symbol}
      />
    </OrderActionsWrapper>
  )
}
