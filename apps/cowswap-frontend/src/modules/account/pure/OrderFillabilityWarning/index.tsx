import { ReactNode } from 'react'

import { BannerOrientation, StatusColorVariant } from '@cowprotocol/ui'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { OrderFillability } from 'modules/ordersTable'

import {
  ApproveWrapper,
  OrderActionsWrapper,
  Subtitle,
  Title,
  UnfillableWarning,
  WrappedAccordionBanner,
} from './styled'

import { OrderPartialApprove } from '../../containers/OrderPartialApprove'

interface OrderFillabilityWarningProps {
  fillability: OrderFillability
  inputAmount: CurrencyAmount<Token>
  enablePartialApprove?: boolean
  enablePartialApproveBySettings?: boolean
  orderId?: string
}

export function OrderFillabilityWarning({
  fillability,
  inputAmount,
  enablePartialApprove,
  enablePartialApproveBySettings,
  orderId,
}: OrderFillabilityWarningProps): ReactNode {
  const title = (
    <Title>
      <span>Order cannot be filled due to insufficient allowance</span>
    </Title>
  )

  const isNotEnoughBalance = fillability?.hasEnoughBalance === false
  const showIsNotEnoughAllowance = !isNotEnoughBalance && fillability?.hasEnoughAllowance === false

  const NotEnoughBalanceDescreption = (
    <Subtitle>Please, top up {inputAmount.currency.symbol} balance or cancel the order.</Subtitle>
  )

  return (
    <>
      {isNotEnoughBalance && (
        <UnfillableWarning
          padding={'10px'}
          bannerType={StatusColorVariant.Danger}
          orientation={BannerOrientation.Horizontal}
          customContent={NotEnoughBalanceDescreption}
          noWrapContent
        >
          <Title marginLeft={'6px'}>Order cannot be filled due to insufficient balance on the current account.</Title>
        </UnfillableWarning>
      )}

      {showIsNotEnoughAllowance && (
        <WrappedAccordionBanner title={title} bannerType={StatusColorVariant.Danger} accordionPadding={'10px'}>
          <OrderActionsWrapper>
            <Subtitle>
              Another order has used up the approval amount. Set a new token approval to proceed with your order.
            </Subtitle>
            <ApproveWrapper>
              {enablePartialApprove && (
                <OrderPartialApprove
                  orderId={orderId}
                  isPartialApproveEnabledBySettings={enablePartialApproveBySettings}
                  amountToApprove={inputAmount}
                />
              )}
            </ApproveWrapper>
          </OrderActionsWrapper>
        </WrappedAccordionBanner>
      )}
    </>
  )
}
