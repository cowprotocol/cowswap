import { ReactNode, useMemo } from 'react'

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

export type OrderPartialApproveProps = {
  amountToApprove: CurrencyAmount<Currency>
}

export function OrderPartialApprove({ amountToApprove }: OrderPartialApproveProps): ReactNode {
  const isPartialApproveSelectedByUser = useIsPartialApproveSelectedByUser()
  const { isModalOpen, amountSetByUser } = usePendingApproveAmountModalState() || {}
  const updatePendingApproveAmountModalState = useUpdatePendingApproveAmountModalState()

  const amountToApproveFinal = useMemo(() => amountSetByUser ?? amountToApprove, [amountSetByUser, amountToApprove])

  if (isModalOpen) {
    return <PendingOrderApproveAmountModal initialAmountToApprove={amountToApproveFinal} />
  }

  return (
    <>
      <TradeApproveToggle
        amountToApprove={amountToApproveFinal}
        updateModalState={() => updatePendingApproveAmountModalState({ isModalOpen: true })}
      />
      {isPartialApproveSelectedByUser && <ActiveOrdersWithAffectedPermit currency={amountToApprove.currency} />}
      <TradeApproveButton
        ignorePermit={true}
        enablePartialApprove={true}
        amountToApprove={amountToApproveFinal}
        label={'Approve ' + amountToApprove.currency.symbol}
      />
    </>
  )
}
