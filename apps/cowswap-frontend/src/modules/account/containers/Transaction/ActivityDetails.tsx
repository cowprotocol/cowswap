import { ReactElement, ReactNode, useMemo } from 'react'

import { COW_TOKEN_TO_CHAIN, V_COW, V_COW_CONTRACT_ADDRESS } from '@cowprotocol/common-const'
import { areAddressesEqual, ExplorerDataType, getExplorerLink, shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useENS } from '@cowprotocol/ens'
import { BridgeStatus } from '@cowprotocol/sdk-bridging'
import { TokenLogo, useTokenBySymbolOrAddress } from '@cowprotocol/tokens'
import { UiOrderType } from '@cowprotocol/types'
import { BannerOrientation, ExternalLink, Icon, IconType, TokenAmount, UI } from '@cowprotocol/ui'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { i18n } from '@lingui/core'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { BRIDGING_FINAL_STATUSES, useBridgeOrderData } from 'entities/bridgeOrders'
import { useAddOrderToSurplusQueue } from 'entities/surplusModal'

import { ActivityState, getActivityState } from 'legacy/hooks/useActivityDerivedState'
import { OrderStatus } from 'legacy/state/orders/actions'

import { useToggleAccountModal } from 'modules/account'
import { BridgeActivitySummary } from 'modules/bridge'
import { EthFlowStepper } from 'modules/ethFlow'
import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { OrderFillability, useGetPendingOrdersPermitValidityState } from 'modules/ordersTable'
import { useSwapPartialApprovalToggleState } from 'modules/swap/hooks/useSwapSettings'
import { ConfirmDetailsItem } from 'modules/trade'

import { OrderHooksDetails } from 'common/containers/OrderHooksDetails'
import { useCancelOrder } from 'common/hooks/useCancelOrder'
import { isPending } from 'common/hooks/useCategorizeRecentActivity'
import { useEnhancedActivityDerivedState } from 'common/hooks/useEnhancedActivityDerivedState'
import { useGetSurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { useSwapAndBridgeContext } from 'common/hooks/useSwapAndBridgeContext'
import { useUltimateOrder } from 'common/hooks/useUltimateOrder'
import { CurrencyLogoPair } from 'common/pure/CurrencyLogoPair'
import { CustomRecipientWarningBanner } from 'common/pure/CustomRecipientWarningBanner'
import { IconSpinner } from 'common/pure/IconSpinner'
import { RateInfo, RateInfoParams } from 'common/pure/RateInfo'
import { SafeWalletLink } from 'common/pure/SafeWalletLink'
import { TransactionInnerDetail } from 'common/pure/TransactionInnerDetail'
import {
  useHideReceiverWalletBanner,
  useIsReceiverWalletBannerHidden,
} from 'common/state/receiverWalletBannerVisibility'
import { ActivityDerivedState, ActivityStatus } from 'common/types/activity'
import { computeOrderSummary } from 'common/updaters/orders/utils'
import { getIsBridgeOrder } from 'common/utils/getIsBridgeOrder'
import { getIsCustomRecipient } from 'utils/orderUtils/getIsCustomRecipient'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { StatusDetails } from './StatusDetails'
import {
  ActivityVisual,
  CreationTimeText,
  DangerText,
  FiatWrapper,
  StyledFiatAmount,
  Summary,
  SummaryInner,
  SummaryInnerRow,
  TextAlert,
  TransactionState as ActivityLink,
} from './styled'

import { OrderFillabilityWarning } from '../../pure/OrderFillabilityWarning'

const progressBarVisibleStates = [ActivityState.OPEN]

const DEFAULT_ORDER_SUMMARY = {
  from: '',
  to: '',
  limitPrice: '',
  validTo: '',
}

// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, complexity
export function GnosisSafeTxDetails(props: {
  chainId: number
  activityDerivedState: ActivityDerivedState
}): ReactElement | null {
  const { chainId, activityDerivedState } = props
  const { gnosisSafeInfo, enhancedTransaction, status, isOrder, order, isExpired, isCancelled, isFailed } =
    activityDerivedState
  const gnosisSafeThreshold = gnosisSafeInfo?.threshold
  const safeTransaction = enhancedTransaction?.safeTransaction || order?.presignGnosisSafeTx
  const isReplaced = enhancedTransaction?.replacementType === 'replaced'

  if (!gnosisSafeThreshold || !gnosisSafeInfo || !safeTransaction) {
    return null
  }

  // The activity is executed Is tx mined or is the swap executed
  const isExecutedActivity = isOrder
    ? order?.fulfillmentTime !== undefined
    : enhancedTransaction?.confirmedTime !== undefined

  // Check if it's in a state where we don't need more signatures. We do this, because this state comes from CoW Swap API, which
  // sometimes can be faster getting the state than Gnosis Safe API (that would give us the pending signatures). We use
  // this check to infer that we don't need to sign anything anymore
  const alreadySigned = isOrder ? status !== ActivityStatus.PRESIGNATURE_PENDING : status !== ActivityStatus.PENDING

  const { confirmations, nonce, isExecuted } = safeTransaction

  const numConfirmations = confirmations?.length ?? 0
  const pendingSignaturesCount = gnosisSafeThreshold - numConfirmations
  const isPendingSignatures = pendingSignaturesCount > 0

  let signaturesMessage: ReactElement

  if (isExecutedActivity) {
    signaturesMessage = (
      <span>
        <Trans>Executed</Trans>
      </span>
    )
  } else if (isCancelled) {
    signaturesMessage = (
      <span>
        <Trans>Cancelled order</Trans>
      </span>
    )
  } else if (isExpired) {
    signaturesMessage = (
      <span>
        <Trans>Expired order</Trans>
      </span>
    )
  } else if (isFailed) {
    signaturesMessage = (
      <span>
        <Trans>Invalid order</Trans>
      </span>
    )
  } else if (alreadySigned) {
    signaturesMessage = (
      <span>
        <Trans>Enough signatures</Trans>
      </span>
    )
  } else if (numConfirmations === 0) {
    signaturesMessage = (
      <>
        <span>
          <b>
            <Trans>No signatures yet</Trans>
          </b>
        </span>
        <TextAlert isPending={isPendingSignatures} isCancelled={isCancelled} isExpired={isExpired}>
          {gnosisSafeThreshold} {gnosisSafeThreshold === 1 ? t`signature is` : t`signatures are`} {t`required`}
        </TextAlert>
      </>
    )
  } else if (numConfirmations >= gnosisSafeThreshold) {
    signaturesMessage = isExecuted ? (
      <span>
        <b>
          <Trans>Enough signatures</Trans>
        </b>
      </span>
    ) : (
      <>
        {!isReplaced && (
          <>
            <span>
              <Trans>
                Enough signatures, <b>but not executed</b>
              </Trans>
            </span>
            <TextAlert isPending={isPendingSignatures} isCancelled={isCancelled} isExpired={isExpired}>
              <Trans>Execute Safe transaction</Trans>
            </TextAlert>
          </>
        )}
      </>
    )
  } else {
    signaturesMessage = (
      <>
        <span>
          <Trans>
            Signed:{' '}
            <b>
              {numConfirmations} out of {gnosisSafeThreshold} signers
            </b>
          </Trans>
        </span>
        <TextAlert isPending={isPendingSignatures} isCancelled={isCancelled} isExpired={isExpired}>
          {pendingSignaturesCount} {pendingSignaturesCount === 1 ? t`more signature is` : t`more signatures are`}{' '}
          {t`required`}
        </TextAlert>
      </>
    )
  }

  return (
    <TransactionInnerDetail>
      <span>
        <Trans>
          Safe Nonce: <b>{nonce}</b>
        </Trans>
      </span>
      {signaturesMessage}

      {/* View in: Gnosis Safe */}
      <SafeWalletLink chainId={chainId} safeTransaction={safeTransaction} asButton />
    </TransactionInnerDetail>
  )
}

interface OrderSummaryType {
  from: ReactNode | undefined
  to: ReactNode | undefined
  limitPrice: string | undefined
  executionPrice?: string | undefined
  validTo: string | undefined
  fulfillmentTime?: string | undefined
  kind?: string
  inputAmount?: CurrencyAmount<Token>
}

// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, complexity
export function ActivityDetails(props: {
  chainId: number
  activityDerivedState: ActivityDerivedState
  activityLinkUrl: string | undefined
  disableMouseActions: boolean | undefined
  creationTime?: string | undefined
  fillability?: OrderFillability
}): ReactNode | null {
  const { activityDerivedState, chainId, activityLinkUrl, disableMouseActions, creationTime, fillability } = props
  const { id, isOrder, order, enhancedTransaction, isExpired, isCancelled, isFailed, isCancelling } =
    activityDerivedState
  const tokenAddress =
    enhancedTransaction?.approval?.tokenAddress ||
    (enhancedTransaction?.claim && V_COW_CONTRACT_ADDRESS[chainId as SupportedChainId])
  const singleToken = useTokenBySymbolOrAddress(tokenAddress) || null

  const [isPartialApproveEnabledBySettings] = useSwapPartialApprovalToggleState()
  const getShowCancellationModal = useCancelOrder()
  const ultimateOrder = useUltimateOrder(chainId, order?.id)

  const isSwap = order && getUiOrderType(order) === UiOrderType.SWAP

  const { disableProgressBar } = useInjectedWidgetParams()

  const skipBridgingDisplay = isExpired || isCancelled || isFailed || isCancelling
  const isBridgeOrder = getIsBridgeOrder(order)

  // Enhanced activity derived state that incorporates bridge status for bridge orders
  const enhancedActivityDerivedState = useEnhancedActivityDerivedState(activityDerivedState, chainId)

  // Use enhanced state to determine when to show progress bar for bridge orders
  const enhancedActivityState = getActivityState(enhancedActivityDerivedState)
  const showProgressBar =
    progressBarVisibleStates.includes(enhancedActivityState) &&
    (isSwap || isBridgeOrder) &&
    order &&
    !disableProgressBar
  const showCancellationModal = order ? getShowCancellationModal(order) : null

  const { surplusFiatValue, showFiatValue, surplusToken, surplusAmount } = useGetSurplusData(order)

  const { name: receiverEnsName } = useENS(order?.receiver)

  const hideCustomRecipientWarning = useHideReceiverWalletBanner()
  const setShowProgressBar = useAddOrderToSurplusQueue() // TODO: not exactly the proper tool, rethink this
  const toggleAccountModal = useToggleAccountModal()

  const fullAppData = order?.apiAdditionalInfo?.fullAppData || order?.fullAppData

  const { swapAndBridgeContext, swapResultContext, swapAndBridgeOverview, intermediateToken } = useSwapAndBridgeContext(
    chainId,
    isBridgeOrder ? order : undefined,
    undefined,
  )

  const bridgeOrderData = useBridgeOrderData(order?.id)

  const bridgingStatus = swapAndBridgeContext?.statusResult?.status
  const isOrderPending = isBridgeOrder
    ? bridgingStatus && bridgingStatus !== BridgeStatus.UNKNOWN
      ? !BRIDGING_FINAL_STATUSES.includes(bridgingStatus)
      : !!bridgeOrderData
    : order && isPending(order)

  const isCustomRecipientWarningBannerVisible = !useIsReceiverWalletBannerHidden(id) && order && isOrderPending

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const showProgressBarCallback = useMemo(() => {
    if (!showProgressBar) {
      return null
    }

    return () => {
      setShowProgressBar(order.id)
      toggleAccountModal()
    }
  }, [showProgressBar, setShowProgressBar, order?.id, toggleAccountModal])

  const pendingOrdersPermitValidityState = useGetPendingOrdersPermitValidityState()
  const hasValidPermit = order ? pendingOrdersPermitValidityState[order.id] : true

  if (!order && !enhancedTransaction) return null

  // Order Summary default object
  let orderSummary: OrderSummaryType
  let rateInfoParams: RateInfoParams = {
    chainId,
    inputCurrencyAmount: null,
    outputCurrencyAmount: null,
    activeRateFiatAmount: null,
    invertedActiveRateFiatAmount: null,
  }
  let isOrderFulfilled = false

  if (order) {
    const {
      inputToken,
      sellAmount,
      feeAmount: feeAmountRaw,
      outputToken,
      buyAmount,
      validTo,
      kind,
      fulfillmentTime,
    } = order

    const effectiveOutputToken = intermediateToken ?? outputToken
    const inputAmount = CurrencyAmount.fromRawAmount(inputToken, sellAmount.toString())
    const outputAmount = CurrencyAmount.fromRawAmount(effectiveOutputToken, buyAmount.toString())
    const feeAmount = CurrencyAmount.fromRawAmount(inputToken, feeAmountRaw.toString())

    isOrderFulfilled = !!order.apiAdditionalInfo && order.status === OrderStatus.FULFILLED

    const { executedSellAmountBeforeFees, executedBuyAmount } = order.apiAdditionalInfo || {}
    const rateInputCurrencyAmount = isOrderFulfilled
      ? CurrencyAmount.fromRawAmount(inputToken, executedSellAmountBeforeFees?.toString() || '0')
      : inputAmount

    const rateOutputCurrencyAmount = isOrderFulfilled
      ? CurrencyAmount.fromRawAmount(effectiveOutputToken, executedBuyAmount?.toString() || '0')
      : outputAmount

    rateInfoParams = {
      chainId,
      inputCurrencyAmount: rateInputCurrencyAmount,
      outputCurrencyAmount: rateOutputCurrencyAmount,
      activeRateFiatAmount: null,
      invertedActiveRateFiatAmount: null,
    }

    const DateFormatOptions: Intl.DateTimeFormatOptions = {
      dateStyle: 'medium',
      timeStyle: 'short',
    }

    const orderKind = kind.toString()

    orderSummary = {
      ...DEFAULT_ORDER_SUMMARY,
      from: <TokenAmount amount={inputAmount.add(feeAmount)} tokenSymbol={inputAmount.currency} />,
      to: <TokenAmount amount={outputAmount} tokenSymbol={outputAmount.currency} />,
      validTo: validTo
        ? new Date((validTo as number) * 1000).toLocaleString(i18n.locale, DateFormatOptions)
        : undefined,
      fulfillmentTime: fulfillmentTime
        ? new Date(fulfillmentTime).toLocaleString(i18n.locale, DateFormatOptions)
        : undefined,
      kind: orderKind === 'sell' ? t`sell` : orderKind === 'buy' ? t`buy` : orderKind,
      inputAmount,
    }
  } else {
    orderSummary = DEFAULT_ORDER_SUMMARY
  }

  const { kind, from, to, fulfillmentTime, validTo } = orderSummary
  const activityName = isOrder ? `${kind} ` + t`order` : t`Transaction`
  let inputToken = activityDerivedState?.order?.inputToken || null
  let outputToken = activityDerivedState?.order?.outputToken || null

  if (enhancedTransaction?.swapVCow || enhancedTransaction?.swapLockedGNOvCow) {
    inputToken = V_COW[chainId as SupportedChainId]
    outputToken = COW_TOKEN_TO_CHAIN[chainId as SupportedChainId]
  }

  const recipient = isBridgeOrder ? swapAndBridgeOverview?.targetRecipient : order?.receiver
  const isCustomRecipient =
    !!order &&
    (isBridgeOrder ? (recipient ? !areAddressesEqual(order.owner, recipient) : false) : getIsCustomRecipient(order))

  const hooksDetails = fullAppData ? (
    <OrderHooksDetails appData={fullAppData} margin="10px 0 0">
      {(children) => (
        <SummaryInnerRow>
          <b>
            <Trans>Hooks</Trans>
          </b>
          <i>{children}</i>
        </SummaryInnerRow>
      )}
    </OrderHooksDetails>
  ) : null

  const orderBasicDetails = (
    <>
      <ConfirmDetailsItem withTimelineDot label={t`Limit price`}>
        <span>
          <RateInfo noLabel rateInfoParams={rateInfoParams} />
        </span>
      </ConfirmDetailsItem>
      <ConfirmDetailsItem withTimelineDot label={t`Valid to`}>
        <span>{validTo}</span>
      </ConfirmDetailsItem>
    </>
  )

  const showWarning = fillability
    ? (!fillability.hasEnoughAllowance && !hasValidPermit) || !fillability.hasEnoughBalance
    : false

  return (
    <>
      {/* Warning banner if custom recipient */}
      {isCustomRecipient && isCustomRecipientWarningBannerVisible && (
        <CustomRecipientWarningBanner
          borderRadius={'12px 12px 0 0'}
          orientation={BannerOrientation.Horizontal}
          onDismiss={() => hideCustomRecipientWarning(id)}
        />
      )}
      <Summary>
        <span>
          {creationTime && <CreationTimeText>{creationTime}</CreationTimeText>}

          {/* Token Approval Currency Logo */}
          {!isOrder && singleToken && (
            <ActivityVisual>
              <TokenLogo token={singleToken} size={32} />
            </ActivityVisual>
          )}

          {/* Order Currency Logo */}
          {inputToken && outputToken && (
            <ActivityVisual>
              {isBridgeOrder && !skipBridgingDisplay && order ? (
                (() => {
                  const isLocalOrderCached = order.inputToken.chainId !== order.outputToken.chainId
                  const hasConfirmedBridgeData = swapAndBridgeContext?.statusResult

                  // For localStorage orders: use order.outputToken immediately (no API wait, no flash)
                  if (isLocalOrderCached) {
                    return <CurrencyLogoPair sellToken={inputToken} buyToken={order.outputToken} tokenSize={32} />
                  }

                  // For fresh sessions: only show CurrencyLogoPair when we have confirmed bridge data
                  if (hasConfirmedBridgeData && swapAndBridgeOverview?.targetCurrency) {
                    return (
                      <CurrencyLogoPair
                        sellToken={inputToken}
                        buyToken={swapAndBridgeOverview.targetCurrency}
                        tokenSize={32}
                      />
                    )
                  }

                  // Show spinner when waiting for API data in fresh sessions (don't use CurrencyLogoPair)
                  return (
                    <>
                      <TokenLogo token={inputToken} size={32} />
                      <IconSpinner spinnerWidth={1} margin="0 0 0 -4px" size={30} />
                    </>
                  )
                })()
              ) : (
                <CurrencyLogoPair sellToken={inputToken} buyToken={outputToken} tokenSize={32} />
              )}
            </ActivityVisual>
          )}
        </span>

        <SummaryInner>
          <b>{activityName}</b>
          {isOrder ? (
            <>
              {order && !skipBridgingDisplay && isBridgeOrder ? (
                <BridgeActivitySummary
                  isCustomRecipientWarning={!!isCustomRecipientWarningBannerVisible}
                  order={order}
                  swapAndBridgeContext={swapAndBridgeContext}
                  swapResultContext={swapResultContext}
                  swapAndBridgeOverview={swapAndBridgeOverview}
                  orderBasicDetails={orderBasicDetails}
                >
                  {hooksDetails}
                </BridgeActivitySummary>
              ) : (
                // Regular order layout
                <>
                  <SummaryInnerRow>
                    <b>
                      <Trans>From</Trans> {kind === 'buy' && ' ' && <Trans>at most</Trans>}
                    </b>
                    <i>{from}</i>
                  </SummaryInnerRow>
                  <SummaryInnerRow>
                    <b>
                      <Trans>To</Trans> {kind === 'sell' && ' ' && <Trans>at least</Trans>}
                    </b>
                    <i>{to}</i>
                  </SummaryInnerRow>
                  <SummaryInnerRow>
                    <b>{isOrderFulfilled ? <Trans>Exec. price</Trans> : <Trans>Limit price</Trans>}</b>
                    <i>
                      <RateInfo noLabel rateInfoParams={rateInfoParams} />
                    </i>
                  </SummaryInnerRow>
                  <SummaryInnerRow isCancelled={isCancelled} isExpired={isExpired}>
                    {fulfillmentTime ? (
                      <>
                        <b>
                          <Trans>Filled on</Trans>
                        </b>
                        <i>{fulfillmentTime}</i>
                      </>
                    ) : (
                      <>
                        <b>
                          <Trans>Valid to</Trans>
                        </b>
                        <i>{validTo}</i>
                      </>
                    )}
                  </SummaryInnerRow>
                  {order && isCustomRecipient && (
                    <SummaryInnerRow>
                      <b>
                        <Trans>Recipient</Trans>:
                      </b>
                      <i>
                        {isCustomRecipientWarningBannerVisible && (
                          <Icon image={IconType.ALERT} color={UI.COLOR_ALERT} description={t`Alert`} size={18} />
                        )}
                        <ExternalLink
                          href={getExplorerLink(chainId, order.receiver || order.owner, ExplorerDataType.ADDRESS)}
                        >
                          {receiverEnsName || shortenAddress(order.receiver || order.owner)} ↗
                        </ExternalLink>
                      </i>
                    </SummaryInnerRow>
                  )}
                  {surplusAmount?.greaterThan(0) && (
                    <SummaryInnerRow>
                      <b>
                        <Trans>Surplus</Trans>
                      </b>
                      <i>
                        <TokenAmount amount={surplusAmount} tokenSymbol={surplusToken} />
                        {showFiatValue && (
                          <FiatWrapper>
                            (<StyledFiatAmount amount={surplusFiatValue} />)
                          </FiatWrapper>
                        )}
                      </i>
                    </SummaryInnerRow>
                  )}
                  {hooksDetails}
                  {fillability && showWarning && orderSummary?.inputAmount ? (
                    <SummaryInnerRow>
                      <DangerText>Unfillable</DangerText>
                      <OrderFillabilityWarning
                        fillability={fillability}
                        inputAmount={orderSummary.inputAmount}
                        enablePartialApproveBySettings={!!isPartialApproveEnabledBySettings}
                        orderId={order?.id}
                      />
                    </SummaryInnerRow>
                  ) : null}
                </>
              )}
            </>
          ) : (
            // Transaction
            (activityDerivedState.summary ??
            // Order
            (ultimateOrder ? computeOrderSummary(ultimateOrder) : null) ??
            id)
          )}

          {activityLinkUrl && enhancedTransaction?.replacementType !== 'replaced' && (
            <ActivityLink href={activityLinkUrl} disableMouseActions={disableMouseActions}>
              <Trans>View details</Trans> ↗
            </ActivityLink>
          )}
          <GnosisSafeTxDetails chainId={chainId} activityDerivedState={activityDerivedState} />
        </SummaryInner>

        {/* Status Details: icon, cancel, links */}
        <StatusDetails
          chainId={chainId}
          showCancellationModal={showCancellationModal}
          activityDerivedState={enhancedActivityDerivedState}
          showProgressBar={showProgressBarCallback}
        />
      </Summary>

      <EthFlowStepper order={order} />
    </>
  )
}
