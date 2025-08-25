import { ReactNode } from 'react'

import { BannerOrientation, StatusColorVariant } from '@cowprotocol/ui'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { TradeApproveButton } from 'modules/erc20Approve'

import { OrderFillability } from 'common/hooks/usePendingOrdersFillability'

import { ApproveWrapper, UnfillableWarning } from './styled'

export function OrderFillabilityWarning({
  fillability,
  inputAmount,
}: {
  fillability: OrderFillability
  inputAmount: CurrencyAmount<Token>
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
            <TradeApproveButton enablePartialApprove={true} amountToApprove={inputAmount} />
          </ApproveWrapper>
        </UnfillableWarning>
      )}
    </>
  )
}
