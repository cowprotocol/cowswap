import { ElementType, ReactElement, ReactNode } from 'react'

import { MessageDescriptor } from '@lingui/core'

import { useMediaQuery, useTimeAgo } from '@cowprotocol/common-hooks'
import { ExplorerDataType, getExplorerLink, isSellOrder, shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Fraction, Token } from '@cowprotocol/currency'
import { Command } from '@cowprotocol/types'
import {
  BannerOrientation,
  BottomDrawer,
  BottomDrawerOrDialog,
  Dialog,
  ExternalLink,
  Icon,
  IconType,
  InlineBanner,
  Media,
  Modal,
  ModalHeader,
  StatusColorVariant,
  UI,
} from '@cowprotocol/ui'

import { msg, t } from '@lingui/core/macro'
import { useLingui, Trans } from '@lingui/react/macro'

import { OrderStatus } from 'legacy/state/orders/actions'
import { getOrderVolumeFee } from 'legacy/state/orders/utils'

import { ConfirmAmounts } from 'modules/trade'
import type { TwapOrderItem } from 'modules/twap'

import { isPending } from 'common/hooks/useCategorizeRecentActivity'
import { CustomRecipientWarningBanner } from 'common/pure/CustomRecipientWarningBanner'
import {
  useHideReceiverWalletBanner,
  useIsReceiverWalletBannerHidden,
} from 'common/state/receiverWalletBannerVisibility'
import { getIsCustomRecipient } from 'utils/orderUtils/getIsCustomRecipient'
import { getIsFinalizedOrder } from 'utils/orderUtils/getIsFinalizedOrder'
import { getSellAmountWithFee } from 'utils/orderUtils/getSellAmountWithFee'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { DateField } from './fields/DateField'
import { FeeField } from './fields/FeeField'
import { FieldLabel } from './fields/FieldLabel'
import { FilledField } from './fields/FilledField'
import { IdField } from './fields/IdField'
import { OrderTypeField } from './fields/OrderTypeField'
import { PriceField } from './fields/PriceField'
import { SafeTxFields } from './fields/SafeTxFields'
import { SurplusField } from './fields/SurplusField'
import * as styledEl from './ReceiptModal.styled'

import { AlternativeOrderModalContext } from '../../state/ordersTable.types'
import { getActivityUrl } from '../../utils/url/getActivityUrl'
import { OrderContextMenu } from '../ContextMenu/OrderContextMenu.pure'
import { OrderStatusBox } from '../OrderStatusBox/OrderStatusBox.pure'

interface ReceiptModalContentProps {
  alternativeOrderModalContext?: AlternativeOrderModalContext
  buyAmount: CurrencyAmount<Token>
  chainId: SupportedChainId
  estimatedExecutionPrice: Fraction | null
  executionPrice: Fraction | null
  isTwapPartOrder: boolean
  limitPrice: Fraction | null
  order: ParsedOrder
  receiverEnsName: string | null
  twapOrder: TwapOrderItem | null
}

interface ReceiptModalHeaderProps {
  alternativeOrderModalContext?: AlternativeOrderModalContext
  chainId?: SupportedChainId
  onDismiss: Command
  order: ParsedOrder | null
  showCancellationModal?: Command | null
  titleAs: ElementType
}

interface ReceiptProps {
  alternativeOrderModalContext?: AlternativeOrderModalContext
  buyAmount?: CurrencyAmount<Token>
  chainId?: SupportedChainId
  estimatedExecutionPrice?: Fraction | null
  executionPrice?: Fraction | null
  isOpen: boolean
  isTwapPartOrder?: boolean
  limitPrice?: Fraction | null
  onDismiss: Command
  order: ParsedOrder | null
  receiverEnsName?: string | null
  showCancellationModal?: Command | null
  twapOrder?: TwapOrderItem | null
}

type RelativeTimeUnit = 'day' | 'hour' | 'minute' | 'month' | 'second' | 'week' | 'year'

function getCompactTimeAgo(value: Date, locale: string): string {
  const secondsFromNow = (value.getTime() - Date.now()) / 1_000

  if (!Number.isFinite(secondsFromNow)) return ''

  const { divisor, unit } = getRelativeTimeUnit(Math.abs(secondsFromNow))
  const result = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' }).format(
    Math.round(secondsFromNow / divisor),
    unit,
  )

  // English short units include periods ("mo."), while the receipt uses compact labels ("mo").
  return locale.startsWith('en') ? result.replaceAll('.', '') : result
}

function getRelativeTimeUnit(absoluteSeconds: number): { divisor: number; unit: RelativeTimeUnit } {
  if (absoluteSeconds < 60) return { divisor: 1, unit: 'second' }
  if (absoluteSeconds < 3_600) return { divisor: 60, unit: 'minute' }
  if (absoluteSeconds < 86_400) return { divisor: 3_600, unit: 'hour' }
  if (absoluteSeconds < 604_800) return { divisor: 86_400, unit: 'day' }
  if (absoluteSeconds < 2_629_800) return { divisor: 604_800, unit: 'week' }
  if (absoluteSeconds < 31_557_600) return { divisor: 2_629_800, unit: 'month' }

  return { divisor: 31_557_600, unit: 'year' }
}

function useCompactTimeAgo(value: Date, locale: string): string {
  useTimeAgo(value, 60_000)

  return getCompactTimeAgo(value, locale)
}

const TOOLTIPS_MSG: Record<string, MessageDescriptor> = {
  NETWORK_COSTS: msg`CoW Protocol covers the fees and costs by executing your order at a slightly better price than your limit price.`,
  CREATED: msg`Your order was created on this date & time. It will remain open until it expires or is filled.`,
  EXPIRY: msg`If your order has not been filled by this date & time, it will expire. Don't worry - expirations and order placement are free on CoW Swap!`,
  TOTAL_FEE: msg`This fee helps pay for maintenance & improvements to the trade experience`,
}

const TOOLTIPS_JSX: Record<string, ReactElement> = {
  ORDER_TYPE: (
    <span>
      <Trans>
        Orders on CoW Swap can either be market orders (which fill at the market price within the slippage tolerance you
        set) or limit orders (which fill at a price you specify).
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

const FEES_SECTION = 'fees'
const METADATA_SECTION = 'metadata'

export function ReceiptModal({
  isOpen,
  onDismiss,
  order,
  chainId,
  buyAmount,
  ...contentProps
}: ReceiptProps): ReactNode {
  const isUpToSmall = useMediaQuery(Media.upToSmall(false))
  const handleOpenChange = (open: boolean): void => {
    if (!open) {
      onDismiss()
    }
  }

  return (
    <BottomDrawerOrDialog isDrawer={isUpToSmall} isOpen={isOpen} onOpenChange={handleOpenChange} variant="narrow">
      <Modal.Root>
        <ReceiptModalHeader
          alternativeOrderModalContext={contentProps.alternativeOrderModalContext}
          chainId={chainId}
          onDismiss={onDismiss}
          order={order}
          showCancellationModal={contentProps.showCancellationModal}
          titleAs={isUpToSmall ? BottomDrawer.Title : Dialog.Title}
        />
        {order && chainId && buyAmount ? (
          <ReceiptModalContent
            alternativeOrderModalContext={contentProps.alternativeOrderModalContext}
            buyAmount={buyAmount}
            chainId={chainId}
            estimatedExecutionPrice={contentProps.estimatedExecutionPrice ?? null}
            executionPrice={contentProps.executionPrice ?? null}
            isTwapPartOrder={contentProps.isTwapPartOrder ?? false}
            limitPrice={contentProps.limitPrice ?? null}
            order={order}
            receiverEnsName={contentProps.receiverEnsName ?? null}
            twapOrder={contentProps.twapOrder ?? null}
          />
        ) : null}
      </Modal.Root>
    </BottomDrawerOrDialog>
  )
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function, complexity
function ReceiptModalContent({
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
}: ReceiptModalContentProps): ReactElement {
  const { i18n } = useLingui()
  const createdAgo = useCompactTimeAgo(order.creationTime, i18n.locale)
  const isCustomRecipientWarningBannerVisible = !useIsReceiverWalletBannerHidden(order.id)
  const hideCustomRecipientWarning = useHideReceiverWalletBanner()

  const isCustomRecipient = getIsCustomRecipient({
    owner: twapOrder?.resolvedOwner ?? order.owner,
    receiver: order.receiver,
  })
  const showCustomRecipientBanner = isCustomRecipient && isCustomRecipientWarningBannerVisible && isPending(order)

  const isSell = isSellOrder(order.kind)
  const inputLabel = isSell ? t`Sell amount` : t`Sell at most`
  const outputLabel = isSell ? t`Expected to receive` : t`Receive exactly`
  const safeTxParams = twapOrder?.safeTxParams
  const volumeFeeBps = getOrderVolumeFee(order.fullAppData)
  const twapOrderN = twapOrder?.order.n
  const showNetworkCosts = !twapOrder || isTwapPartOrder
  const showFeesSection = !!volumeFeeBps || showNetworkCosts
  const volumeFeePercent = volumeFeeBps ? (volumeFeeBps / 100).toFixed(2) : null
  const activityUrl = getActivityUrl(chainId, order)
  const isFinalized = getIsFinalizedOrder(order)
  const hasFill = order.executionData.filledPercentage.gt(0)
  const isVirtualTwapPart = !!order.composableCowInfo?.isVirtualPart
  const isTwapParent =
    (!!twapOrder && !isTwapPartOrder) || (!!order.isEoaTwapOrder && !order.composableCowInfo?.parentId)
  const showExecutionData = !isVirtualTwapPart && !isTwapParent
  const showFillOutcome = showExecutionData && (hasFill || isFinalized)
  const showEstimatedExecutionPrice =
    showExecutionData && !hasFill && order.status === OrderStatus.PENDING && !!estimatedExecutionPrice
  const showActualExecutionPrice = showExecutionData && hasFill && !!executionPrice

  return (
    <Modal.Content $noPadding>
      <styledEl.ReceiptContent>
        {twapOrder ? (
          <InlineBanner bannerType={StatusColorVariant.Info}>
            <p>
              {isTwapPartOrder ? (
                <Trans>Part of a {twapOrderN}-part TWAP order split</Trans>
              ) : (
                <Trans>TWAP order split into {twapOrderN} parts</Trans>
              )}
            </p>
          </InlineBanner>
        ) : null}

        <ConfirmAmounts
          variant="slim"
          inputCurrencyInfo={{
            amount: getSellAmountWithFee(order),
            balance: null,
            fiatAmount: null,
            label: inputLabel,
          }}
          outputCurrencyInfo={{ amount: buyAmount, balance: null, fiatAmount: null, label: outputLabel }}
          priceImpact={{ loading: false, priceImpact: undefined }}
        />

        {showFillOutcome ? (
          <>
            <FilledField order={order} />
            <SurplusField order={order} />
          </>
        ) : null}

        {showCustomRecipientBanner ? (
          <CustomRecipientWarningBanner
            borderRadius="16px"
            orientation={BannerOrientation.Horizontal}
            onDismiss={() => hideCustomRecipientWarning(order.id)}
          />
        ) : null}

        <styledEl.FieldsCard>
          {order.receiver ? (
            <styledEl.Field>
              <FieldLabel label={t`Recipient`} />
              <styledEl.RecipientValue>
                {showCustomRecipientBanner ? (
                  <Icon image={IconType.ALERT} color={UI.COLOR_ALERT} description={t`Alert`} />
                ) : null}
                <ExternalLink href={getExplorerLink(chainId, order.receiver, ExplorerDataType.ADDRESS)}>
                  {receiverEnsName || shortenAddress(order.receiver)} ↗
                </ExternalLink>
              </styledEl.RecipientValue>
            </styledEl.Field>
          ) : null}

          <styledEl.Field>
            <FieldLabel label={t`Limit price`} />
            <PriceField order={order} price={limitPrice} />
          </styledEl.Field>

          {showEstimatedExecutionPrice || showActualExecutionPrice ? (
            <styledEl.Field>
              {showEstimatedExecutionPrice ? (
                <>
                  <FieldLabel label={t`Executes at`} />
                  <PriceField order={order} price={estimatedExecutionPrice} />
                </>
              ) : (
                <>
                  <FieldLabel label={order.partiallyFillable ? t`Avg. execution` : t`Execution price`} />
                  <PriceField order={order} price={executionPrice} />
                </>
              )}
            </styledEl.Field>
          ) : null}
        </styledEl.FieldsCard>

        <styledEl.DisclosureGroup defaultValue={[]}>
          {showFeesSection ? (
            <styledEl.DisclosureItem value={FEES_SECTION}>
              <styledEl.DisclosureHeader>
                <styledEl.DisclosureTrigger>
                  <Trans>Fees & costs</Trans>
                  <styledEl.DisclosureSummary>
                    {volumeFeePercent ? <Trans>{volumeFeePercent}% fee</Trans> : <Trans>View details</Trans>}
                    <styledEl.DisclosureChevron aria-hidden />
                  </styledEl.DisclosureSummary>
                </styledEl.DisclosureTrigger>
              </styledEl.DisclosureHeader>
              <styledEl.DisclosurePanel>
                <styledEl.DisclosureFields>
                  {volumeFeeBps ? (
                    <styledEl.Field>
                      <FieldLabel label={t`Total fee`} tooltip={i18n._(TOOLTIPS_MSG.TOTAL_FEE)} />
                      <styledEl.Value>{volumeFeePercent}%</styledEl.Value>
                    </styledEl.Field>
                  ) : null}

                  {showNetworkCosts ? (
                    <styledEl.Field>
                      <FieldLabel label={t`Network fees and costs`} tooltip={i18n._(TOOLTIPS_MSG.NETWORK_COSTS)} />
                      <FeeField order={order} />
                    </styledEl.Field>
                  ) : null}
                </styledEl.DisclosureFields>
              </styledEl.DisclosurePanel>
            </styledEl.DisclosureItem>
          ) : null}

          <styledEl.DisclosureItem value={METADATA_SECTION}>
            <styledEl.DisclosureHeader>
              <styledEl.DisclosureTrigger>
                <Trans>Order metadata</Trans>
                <styledEl.DisclosureSummary>
                  <Trans>Created {createdAgo}</Trans>
                  <styledEl.DisclosureChevron aria-hidden />
                </styledEl.DisclosureSummary>
              </styledEl.DisclosureTrigger>
            </styledEl.DisclosureHeader>
            <styledEl.DisclosurePanel>
              <styledEl.DisclosureFields>
                <styledEl.Field>
                  <FieldLabel label={t`Created`} tooltip={i18n._(TOOLTIPS_MSG.CREATED)} />
                  <DateField date={order.creationTime} />
                </styledEl.Field>

                <styledEl.Field>
                  <FieldLabel label={t`Expiry`} tooltip={i18n._(TOOLTIPS_MSG.EXPIRY)} />
                  <DateField date={order.expirationTime} />
                </styledEl.Field>

                <styledEl.Field>
                  <FieldLabel label={t`Order type`} tooltip={TOOLTIPS_JSX.ORDER_TYPE} />
                  <OrderTypeField order={order} />
                </styledEl.Field>

                {activityUrl && order.executionData.activityId ? (
                  <styledEl.Field>
                    <FieldLabel
                      label={
                        typeof order.executionData.activityTitle === 'string'
                          ? order.executionData.activityTitle
                          : i18n._(order.executionData.activityTitle)
                      }
                    />
                    <IdField id={order.executionData.activityId} chainId={chainId} />
                  </styledEl.Field>
                ) : null}

                {twapOrder && safeTxParams ? (
                  <SafeTxFields
                    chainId={chainId}
                    safeAddress={twapOrder.safeAddress}
                    safeTxHash={safeTxParams.safeTxHash}
                    nonce={safeTxParams.nonce}
                    confirmations={safeTxParams.confirmations}
                    confirmationsRequired={safeTxParams.confirmationsRequired}
                  />
                ) : null}
              </styledEl.DisclosureFields>
            </styledEl.DisclosurePanel>
          </styledEl.DisclosureItem>
        </styledEl.DisclosureGroup>

        {isFinalized && alternativeOrderModalContext ? (
          <styledEl.ActionButton onClick={alternativeOrderModalContext.showAlternativeOrderModal}>
            {alternativeOrderModalContext.isEdit ? <Trans>Edit this order</Trans> : <Trans>Recreate this order</Trans>}
          </styledEl.ActionButton>
        ) : null}
      </styledEl.ReceiptContent>
    </Modal.Content>
  )
}

function ReceiptModalHeader({
  alternativeOrderModalContext,
  chainId,
  onDismiss,
  order,
  showCancellationModal,
  titleAs,
}: ReceiptModalHeaderProps): ReactNode {
  const activityUrl = order && chainId ? getActivityUrl(chainId, order) : undefined
  const showContextMenu =
    !!order && !getIsFinalizedOrder(order) && !!(activityUrl || showCancellationModal || alternativeOrderModalContext)

  return (
    <ModalHeader
      sticky
      titleAs={titleAs}
      title={
        <styledEl.TitleWrapper>
          <styledEl.Title>
            <Trans>Order receipt</Trans>
          </styledEl.Title>
          {order ? <OrderStatusBox order={order} widthAuto /> : null}
        </styledEl.TitleWrapper>
      }
      rightSlot={
        showContextMenu ? (
          <OrderContextMenu
            activityUrl={activityUrl}
            showCancellationModal={
              showCancellationModal
                ? () => {
                    onDismiss()
                    showCancellationModal()
                  }
                : null
            }
            alternativeOrderModalContext={alternativeOrderModalContext}
            ariaLabel={t`Order actions`}
            triggerSize={44}
          />
        ) : null
      }
      onClose={onDismiss}
      closeOnEscape={false}
      closeAriaLabel={t`Close order receipt`}
    />
  )
}
