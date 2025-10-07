import { ReactNode } from 'react'

import { BannerOrientation, StatusColorVariant } from '@cowprotocol/ui'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { OrderFillability } from 'common/hooks/usePendingOrdersFillability'
import { AccordionBanner } from 'common/pure/AccordionBanner'

import { ApproveWrapper, OrderActionsWrapper, Subtitle, Title, UnfillableWarning, Wrapper } from './styled'

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
    <Title>
      <span>Order cannot be filled due to insufficient allowance</span>
    </Title>
  )

  return (
    <Wrapper>
      {fillability?.hasEnoughBalance === false && (
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

      {fillability?.hasEnoughAllowance === false && (
        <AccordionBanner title={title} bannerType={StatusColorVariant.Danger} accordionPadding={'10px'}>
          <OrderActionsWrapper>
            <Subtitle>
              Another order has used up the approval amount. Set a new token approval to proceed with your order.
            </Subtitle>
            <ApproveWrapper>
              {enablePartialApprove && !isCustomApproveModalOpen && (
                <OrderPartialApprove
                  isPartialApproveEnabledBySettings={enablePartialApproveBySettings}
                  amountToApprove={inputAmount}
                />
              )}
            </ApproveWrapper>
          </OrderActionsWrapper>
        </AccordionBanner>
      )}
    </Wrapper>
  )
}
