import { ReactNode } from 'react'

import { BannerOrientation, StatusColorVariant } from '@cowprotocol/ui'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { OrderFillability } from 'common/hooks/usePendingOrdersFillability'

import { ApproveWrapper, UnfillableWarning } from './styled'

import { OrderPartialApprove } from '../../containers/OrderPartialApprove'

export function OrderFillabilityWarning({
  fillability,
  inputAmount,
  enablePartialApprove,
  enablePartialApproveBySettings,
  isCustomApproveModalOpen,
}: {
  fillability: OrderFillability
  inputAmount: CurrencyAmount<Token>
  enablePartialApprove?: boolean
  enablePartialApproveBySettings?: boolean
  isCustomApproveModalOpen?: boolean
}): ReactNode {
  return (
    <>
      {fillability?.hasEnoughBalance === false && (
        <UnfillableWarning bannerType={StatusColorVariant.Danger} orientation={BannerOrientation.Horizontal}>
          Order cannot be filled due to insufficient balance on the current account.
          <br />
          Please, top up {inputAmount.currency.symbol} balance or cancel the order.
        </UnfillableWarning>
      )}

      {fillability?.hasEnoughAllowance === false && (
        <UnfillableWarning bannerType={StatusColorVariant.Danger} orientation={BannerOrientation.Horizontal}>
          Order cannot be filled due to insufficient allowance on the current account.
          <ApproveWrapper>
            {enablePartialApprove && enablePartialApproveBySettings && !isCustomApproveModalOpen && (
              <OrderPartialApprove amountToApprove={inputAmount} />
            )}
          </ApproveWrapper>
        </UnfillableWarning>
      )}
    </>
  )
}
