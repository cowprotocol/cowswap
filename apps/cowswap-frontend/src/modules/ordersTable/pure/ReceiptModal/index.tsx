import { ReactElement } from 'react'

import { ExplorerDataType, getExplorerLink, isSellOrder, shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { BannerOrientation, ExternalLink, Icon, IconType, InlineBanner, StatusColorVariant, UI } from '@cowprotocol/ui'
import { CurrencyAmount, Fraction, Token } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { CloseIcon } from 'theme'

import { OrderStatus } from 'legacy/state/orders/actions'
import { getOrderVolumeFee } from 'legacy/state/orders/utils'

import { TwapOrderItem } from 'modules/twap/types'

import { isPending } from 'common/hooks/useCategorizeRecentActivity'
import { CustomRecipientWarningBanner } from 'common/pure/CustomRecipientWarningBanner'
import { CowModal } from 'common/pure/Modal'
import {
  useHideReceiverWalletBanner,
  useIsReceiverWalletBannerHidden,
} from 'common/state/receiverWalletBannerVisibility'
import { getIsCustomRecipient } from 'utils/orderUtils/getIsCustomRecipient'
import { getSellAmountWithFee } from 'utils/orderUtils/getSellAmountWithFee'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { CurrencyField } from './CurrencyField'
import { DateField } from './DateField'
import { FeeField } from './FeeField'
import { FieldLabel } from './FieldLabel'
import { SafeTxFields } from './fields/SafeTxFields'
import { FilledField } from './FilledField'
import { IdField } from './IdField'
import { OrderTypeField } from './OrderTypeField'
import { PriceField } from './PriceField'
import { StatusField } from './StatusField'
import * as styledEl from './styled'
import { SurplusField } from './SurplusField'

import { AlternativeOrderModalContext } from '../../types'

interface ReceiptProps {
  isOpen: boolean
  order: ParsedOrder
  receiverEnsName: string | null
  twapOrder: TwapOrderItem | null
  isTwapPartOrder: boolean
  chainId: SupportedChainId
  onDismiss: Command
  sellAmount: CurrencyAmount<Token>
  buyAmount: CurrencyAmount<Token>
  limitPrice: Fraction | null
  executionPrice: Fraction | null
  estimatedExecutionPrice: Fraction | null
  alternativeOrderModalContext: AlternativeOrderModalContext
}

function useReceiptTooltips(): Record<string, string | ReactElement> {
  const FILLED_COMMON_TOOLTIP = t`How much of the order has been filled.`
  return {
    LIMIT_PRICE: t`You will receive this price or better for your tokens.`,
    EXECUTION_PRICE: t`An order’s actual execution price will vary based on the market price and network costs.`,
    EXECUTES_AT: t`Network costs (incl. gas) are covered by filling your order when the market price is better than your limit price.`,
    FILLED_TWAP: FILLED_COMMON_TOOLTIP,
    FILLED: (
      <span>
        {FILLED_COMMON_TOOLTIP}
        <br />
        <Trans>
          Market orders are always <i>Fill or kill</i>, while limit orders are by default <i>Partially fillable</i>, but
          can also be changed to <i>Fill or kill</i> through your order settings.
        </Trans>
      </span>
    ),
    SURPLUS: t`The amount of extra tokens you get on top of your limit price.`,
    NETWORK_COSTS: t`CoW Protocol covers the costs by executing your order at a slightly better price than your limit price.`,
    CREATED: t`Your order was created on this date & time. It will remain open until it expires or is filled.`,
    RECEIVER: t`The account address which will/did receive the bought amount.`,
    EXPIRY: t`If your order has not been filled by this date & time, it will expire. Don't worry - expirations and order placement are free on CoW Swap!`,
    TOTAL_FEE: t`This fee helps pay for maintenance & improvements to the trade experience`,
    ORDER_TYPE: (
      <span>
        <Trans>
          Orders on CoW Swap can either be market orders (which fill at the market price within the slippage tolerance
          you set) or limit orders (which fill at a price you specify).
        </Trans>
        <br />
        <br />
        <Trans>
          Market orders are always <i>Fill or kill</i>, while limit orders are by default <i>Partially fillable</i>, but
          can also be changed to <i>Fill or kill</i> through your order settings.
        </Trans>
      </span>
    ),
  }
}

const TWAP_PART_ORDER_EXISTS_STATES = new Set([OrderStatus.PENDING, OrderStatus.FULFILLED, OrderStatus.EXPIRED])

// TODO: add cosmos fixture for this component
// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
export function ReceiptModal({
  isOpen,
  onDismiss,
  order,
  twapOrder,
  isTwapPartOrder,
  chainId,
  buyAmount,
  limitPrice,
  executionPrice,
  estimatedExecutionPrice,
  receiverEnsName,
  alternativeOrderModalContext,
}: ReceiptProps) {
  const tooltips = useReceiptTooltips()

  // Check if Custom Recipient Warning Banner should be visible
  const isCustomRecipientWarningBannerVisible = !useIsReceiverWalletBannerHidden(order.id)
  const hideCustomRecipientWarning = useHideReceiverWalletBanner()

  const isCustomRecipient = getIsCustomRecipient(order)
  const showCustomRecipientBanner = isCustomRecipient && isCustomRecipientWarningBannerVisible && isPending(order)

  if (!order || !chainId) {
    return null
  }

  const twapPartOrderExists = isTwapPartOrder && TWAP_PART_ORDER_EXISTS_STATES.has(order.status)

  const isSell = isSellOrder(order.kind)

  const inputLabel = isSell ? t`You sell` : t`You sell at most`
  const outputLabel = isSell ? t`You receive at least` : t`You receive exactly`
  const safeTxParams = twapOrder?.safeTxParams

  const volumeFeeBps = getOrderVolumeFee(order.fullAppData)
  const twapOrderN = twapOrder?.order.n

  return (
    <CowModal onDismiss={onDismiss} isOpen={isOpen}>
      <styledEl.Wrapper>
        <styledEl.Header>
          <div>
            <styledEl.Title>Order Receipt</styledEl.Title>
            {alternativeOrderModalContext && (
              <styledEl.LightButton onClick={alternativeOrderModalContext.showAlternativeOrderModal}>
                {alternativeOrderModalContext.isEdit ? t`Edit` : t`Recreate`} t`this order`
              </styledEl.LightButton>
            )}
          </div>
          <CloseIcon onClick={() => onDismiss()} />
        </styledEl.Header>

        {twapOrder && (
          <styledEl.InfoBannerWrapper>
            <InlineBanner bannerType={StatusColorVariant.Info}>
              <p>
                {isTwapPartOrder ? (
                  <Trans>Part of a {twapOrderN}-part TWAP order split</Trans>
                ) : (
                  <Trans>TWAP order split into {twapOrderN} parts</Trans>
                )}
              </p>
            </InlineBanner>
          </styledEl.InfoBannerWrapper>
        )}

        <styledEl.Body>
          <CurrencyField amount={getSellAmountWithFee(order)} token={order.inputToken} label={inputLabel} />
          <CurrencyField amount={buyAmount} token={order.outputToken} label={outputLabel} />

          <styledEl.FieldsWrapper>
            {/* If custom recipient show warning banner */}
            {showCustomRecipientBanner && (
              <CustomRecipientWarningBanner
                borderRadius={'12px 12px 0 0'}
                orientation={BannerOrientation.Horizontal}
                onDismiss={() => hideCustomRecipientWarning(order.id)}
              />
            )}

            <styledEl.Field>
              <FieldLabel label={t`Status`} />
              <StatusField order={order} />
            </styledEl.Field>

            {order.receiver && (
              <styledEl.Field>
                <FieldLabel label={t`Recipient`} tooltip={tooltips.RECEIVER} />
                <div>
                  {showCustomRecipientBanner && (
                    <Icon image={IconType.ALERT} color={UI.COLOR_ALERT} description={t`Alert`} />
                  )}
                  <ExternalLink href={getExplorerLink(chainId, order.receiver, ExplorerDataType.ADDRESS)}>
                    {receiverEnsName || shortenAddress(order.receiver)} ↗
                  </ExternalLink>
                </div>
              </styledEl.Field>
            )}

            <styledEl.Field>
              <FieldLabel label={t`Limit price (incl.costs)`} tooltip={tooltips.LIMIT_PRICE} />
              <PriceField order={order} price={limitPrice} />
            </styledEl.Field>

            {(!twapOrder || isTwapPartOrder) && (
              <styledEl.Field>
                {estimatedExecutionPrice && order.status === OrderStatus.PENDING ? (
                  <>
                    <FieldLabel label={t`Executes at`} tooltip={tooltips.EXECUTES_AT} />
                    <PriceField order={order} price={estimatedExecutionPrice} />
                  </>
                ) : (
                  <>
                    <FieldLabel
                      label={order.partiallyFillable ? t`Avg. execution price` : t`Execution price`}
                      tooltip={tooltips.EXECUTION_PRICE}
                    />{' '}
                    <PriceField order={order} price={executionPrice} />
                  </>
                )}
              </styledEl.Field>
            )}

            {volumeFeeBps && (
              <styledEl.Field>
                <FieldLabel label={t`Total fee`} tooltip={tooltips.TOTAL_FEE} />
                <span>{(volumeFeeBps / 100).toFixed(2)}%</span>
              </styledEl.Field>
            )}

            <styledEl.Field>
              <FieldLabel label={t`Filled`} tooltip={twapOrder ? tooltips.FILLED_TWAP : tooltips.FILLED} />
              <FilledField order={order} />
            </styledEl.Field>

            <styledEl.Field>
              <FieldLabel label={t`Order surplus`} tooltip={tooltips.SURPLUS} />
              <SurplusField order={order} />
            </styledEl.Field>

            {/*TODO: Currently, we don't have this information for parent TWAP orders*/}
            {/*The condition should be removed once we have the data*/}
            {(!twapOrder || isTwapPartOrder) && (
              <>
                <styledEl.Field>
                  <FieldLabel label={t`Network costs`} tooltip={tooltips.NETWORK_COSTS} />
                  <FeeField order={order} />
                </styledEl.Field>
              </>
            )}

            <styledEl.Field>
              <FieldLabel label={t`Created`} tooltip={tooltips.CREATED} />
              <DateField date={order.creationTime} />
            </styledEl.Field>

            <styledEl.Field>
              <FieldLabel label={t`Expiry`} tooltip={tooltips.EXPIRY} />
              <DateField date={order.expirationTime} />
            </styledEl.Field>

            <styledEl.Field>
              <FieldLabel label={t`Order type`} tooltip={tooltips.ORDER_TYPE} />
              <OrderTypeField order={order} />
            </styledEl.Field>

            {/*TODO: add a link to explorer when it will support TWAP orders*/}
            {(!twapOrder || twapPartOrderExists) && (
              <styledEl.Field>
                {order.executionData.activityId && (
                  <>
                    <FieldLabel label={order.executionData.activityTitle} />
                    <IdField id={order.executionData.activityId} chainId={chainId} />
                  </>
                )}
              </styledEl.Field>
            )}
            {/*TODO: make it more generic. The ReceiptModal should know about TWAP and should display Safe info for any ComposableCow order*/}
            {twapOrder && safeTxParams && (
              <SafeTxFields
                chainId={chainId}
                safeAddress={twapOrder.safeAddress}
                safeTxHash={safeTxParams.safeTxHash}
                nonce={safeTxParams.nonce}
                confirmations={safeTxParams.confirmations}
                confirmationsRequired={safeTxParams.confirmationsRequired}
              />
            )}
          </styledEl.FieldsWrapper>
        </styledEl.Body>
      </styledEl.Wrapper>
    </CowModal>
  )
}
