import { ReactNode } from 'react'

import { ButtonSize } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import {
  ActiveOrdersWithAffectedPermit,
  PartialApproveAmountModal,
  TradeApproveButton,
  TradeApproveToggle,
  useIsPartialApproveSelectedByUser,
  usePartialApproveAmountModalState,
  useUpdatePartialApproveAmountModalState,
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
  const { isModalOpen, amountSetByUser } = usePartialApproveAmountModalState() || {}
  const updatePartialApproveAmountModalState = useUpdatePartialApproveAmountModalState()

  const amountToApproveFinal = amountSetByUser ?? amountToApprove

  if (isModalOpen) {
    return <PartialApproveAmountModal initialAmountToApprove={amountToApproveFinal} />
  }

  return (
    <OrderActionsWrapper>
      {isPartialApproveEnabledBySettings && (
        <TradeApproveToggle
          amountToApprove={amountToApproveFinal}
          updateModalState={() => updatePartialApproveAmountModalState({ isModalOpen: true })}
        />
      )}
      {isPartialApproveSelectedByUser && <ActiveOrdersWithAffectedPermit currency={amountToApprove.currency} />}
      <TradeApproveButton
        ignorePermit
        enablePartialApprove
        useModals={false}
        amountToApprove={amountToApproveFinal}
        buttonSize={ButtonSize.SMALL}
        label={'Approve ' + amountToApprove.currency.symbol}
      />
    </OrderActionsWrapper>
  )
}
