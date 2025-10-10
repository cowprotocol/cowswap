import { ReactNode } from 'react'

import { BannerOrientation, StatusColorVariant } from '@cowprotocol/ui'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { OrderFillability } from 'common/hooks/usePendingOrdersFillability'
import { AccordionBanner } from 'common/pure/AccordionBanner'

import { ApproveWrapper, OrderActionsWrapper, Subtitle, Title, UnfillableWarning } from './styled'

import { OrderPartialApprove } from '../../containers/OrderPartialApprove'

export function OrderFillabilityWarning({
  fillability,
  inputAmount,
  enablePartialApprove,
  enablePartialApproveBySettings,
}: {
  fillability: OrderFillability
  inputAmount: CurrencyAmount<Token>
  enablePartialApprove?: boolean
  enablePartialApproveBySettings?: boolean
}): ReactNode {
  const title = (
    <Title>
      <span>Order cannot be filled due to insufficient allowance</span>
    </Title>
  )

  const isNotEnoughBalance = fillability?.hasEnoughBalance === false
  const showIsNotEnoughAllowance = !isNotEnoughBalance && fillability?.hasEnoughAllowance === false

  return (
    <>
      {isNotEnoughBalance && (
        <UnfillableWarning
          padding={'10px'}
          bannerType={StatusColorVariant.Danger}
          orientation={BannerOrientation.Horizontal}
        >
          Order cannot be filled due to insufficient balance on the current account.
          <br />
          Please, top up {inputAmount.currency.symbol} balance or cancel the order.
        </UnfillableWarning>
      )}

      {showIsNotEnoughAllowance && (
        <AccordionBanner title={title} bannerType={StatusColorVariant.Danger} accordionPadding={'10px'}>
          <OrderActionsWrapper>
            <Subtitle>
              Another order has used up the approval amount. Set a new token approval to proceed with your order.
            </Subtitle>
            <ApproveWrapper>
              {enablePartialApprove && (
                <OrderPartialApprove
                  isPartialApproveEnabledBySettings={enablePartialApproveBySettings}
                  amountToApprove={inputAmount}
                />
              )}
            </ApproveWrapper>
          </OrderActionsWrapper>
        </AccordionBanner>
      )}
    </>
  )
}
