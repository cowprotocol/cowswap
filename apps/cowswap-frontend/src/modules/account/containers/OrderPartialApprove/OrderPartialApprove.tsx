import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import {
  ActiveOrdersWithAffectedPermit,
  TradeApproveToggle,
  useIsPartialApproveSelectedByUser,
} from 'modules/erc20Approve'

export type OrderPartialApproveProps = {
  amountToApprove: CurrencyAmount<Currency>
}

export function OrderPartialApprove({ amountToApprove }: OrderPartialApproveProps): ReactNode {
  const isPartialApproveSelectedByUser = useIsPartialApproveSelectedByUser()

  return (
    <>
      <TradeApproveToggle amountToApprove={amountToApprove} updateModalState={() => {}} />
      {isPartialApproveSelectedByUser && <ActiveOrdersWithAffectedPermit currency={amountToApprove.currency} />}
    </>
  )
}
