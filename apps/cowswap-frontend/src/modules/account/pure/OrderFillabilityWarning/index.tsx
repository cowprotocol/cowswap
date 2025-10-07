import { ReactNode } from 'react'

import { BannerOrientation, StatusColorVariant } from '@cowprotocol/ui'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { AlertCircle } from 'react-feather'

import { OrderFillability } from 'common/hooks/usePendingOrdersFillability'

import { ApproveWrapper, UnfillableWarning } from './styled'

import { AccordionBanner } from '../../../../common/pure/AccordionBanner'
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
  const title = (
    <>
      <AlertCircle />
      Order cannot be filled due to insufficient allowance
    </>
  )

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
        <AccordionBanner title={title}>
          Another order has used up the approval amount. Set a new token approval to proceed with your order.
          <ApproveWrapper>
            {enablePartialApprove && enablePartialApproveBySettings && !isCustomApproveModalOpen && (
              <OrderPartialApprove amountToApprove={inputAmount} />
            )}
          </ApproveWrapper>
        </AccordionBanner>
      )}
    </>
  )
}
