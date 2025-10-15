import { ReactNode } from 'react'

import { BannerOrientation, StatusColorVariant } from '@cowprotocol/ui'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Trans } from '@lingui/react/macro'

import { OrderFillability } from 'common/hooks/usePendingOrdersFillability'

import {
  ApproveWrapper,
  OrderActionsWrapper,
  Subtitle,
  Title,
  UnfillableWarning,
  WrappedAccordionBanner,
} from './styled'

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
      <span>
        <Trans>Order cannot be filled due to insufficient allowance</Trans>
      </span>
    </Title>
  )

  const isNotEnoughBalance = fillability?.hasEnoughBalance === false
  const showIsNotEnoughAllowance = !isNotEnoughBalance && fillability?.hasEnoughAllowance === false
  const symbol = inputAmount.currency.symbol

  const NotEnoughBalanceDescription = (
    <Subtitle>
      <Trans>Please, top up {symbol} balance or cancel the order.</Trans>
    </Subtitle>
  )

  return (
    <>
      {isNotEnoughBalance && (
        <UnfillableWarning
          padding={'10px'}
          bannerType={StatusColorVariant.Danger}
          orientation={BannerOrientation.Horizontal}
          customContent={NotEnoughBalanceDescription}
          noWrapContent
        >
          <Title marginLeft={'6px'}>
            <Trans>Order cannot be filled due to insufficient balance on the current account.</Trans>
          </Title>
        </UnfillableWarning>
      )}

      {showIsNotEnoughAllowance && (
        <WrappedAccordionBanner title={title} bannerType={StatusColorVariant.Danger} accordionPadding={'10px'}>
          <OrderActionsWrapper>
            <Subtitle>
              <Trans>
                Another order has used up the approval amount. Set a new token approval to proceed with your order.
              </Trans>
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
        </WrappedAccordionBanner>
      )}
    </>
  )
}
