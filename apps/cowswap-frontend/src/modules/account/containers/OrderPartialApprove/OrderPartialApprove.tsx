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
  isPartialApproveEnabledBySettings?: boolean
  buttonSize?: ButtonSize
  className?: string
}

export function OrderPartialApprove({
  amountToApprove,
  isPartialApproveEnabledBySettings,
  buttonSize = ButtonSize.SMALL,
  className = '',
}: OrderPartialApproveProps): ReactNode {
  const isPartialApproveSelectedByUser = useIsPartialApproveSelectedByUser()
  const { isModalOpen, amountSetByUser } = usePendingApproveAmountModalState() || {}
  const updatePendingApproveAmountModalState = useUpdatePendingApproveAmountModalState()

  const amountToApproveFinal = amountSetByUser ?? amountToApprove

  if (isModalOpen) {
    return <PendingOrderApproveAmountModal initialAmountToApprove={amountToApproveFinal} />
  }

  return (
    <OrderActionsWrapper className={className}>
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
        buttonSize={buttonSize}
        label={'Approve ' + amountToApprove.currency.symbol}
      />
    </OrderActionsWrapper>
  )
}
