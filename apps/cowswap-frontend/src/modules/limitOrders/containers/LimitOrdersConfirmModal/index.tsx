import { useAtom, useAtomValue } from 'jotai'
import { ReactElement, ReactNode, useCallback, useMemo, useRef } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'
import { TokenSymbol } from '@cowprotocol/ui'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { LimitOrdersWarnings } from 'modules/limitOrders/containers/LimitOrdersWarnings'
import { useHandleOrderPlacement } from 'modules/limitOrders/hooks/useHandleOrderPlacement'
import { useLimitOrdersWarningsAccepted } from 'modules/limitOrders/hooks/useLimitOrdersWarningsAccepted'
import { useRateImpact } from 'modules/limitOrders/hooks/useRateImpact'
import { executionPriceAtom } from 'modules/limitOrders/state/executionPriceAtom'
import { limitOrdersSettingsAtom } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { limitRateAtom } from 'modules/limitOrders/state/limitRateAtom'
import {
  partiallyFillableOverrideAtom,
  type PartiallyFillableOverrideDispatcherType,
} from 'modules/limitOrders/state/partiallyFillableOverride'
import { TradeConfirmation, TradeConfirmModal, useTradeConfirmActions } from 'modules/trade'
import { TradeConfirmationProps } from 'modules/trade/pure/TradeConfirmation'

import { useIsSafeApprovalBundle } from 'common/hooks/useIsSafeApprovalBundle'
import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'

import { buildPlaceLimitOrderEvent, ExecutionPriceLike } from './analytics'

import { LOW_RATE_THRESHOLD_PERCENT } from '../../const/trade'
import { LimitOrdersDetails } from '../../pure/LimitOrdersDetails'
import { TradeFlowContext } from '../../services/types'
import { TradeRateDetails } from '../TradeRateDetails'

const CONFIRM_TITLE = 'Limit Order'
const DEFAULT_BUTTON_TEXT = 'Place limit order'

type LimitOrdersDetailsProps = Parameters<typeof LimitOrdersDetails>[0]

function useStableTradeContext(tradeContext: TradeFlowContext): TradeFlowContext {
  const initialContextRef = useRef<TradeFlowContext | null>(null)

  if (!initialContextRef.current) {
    initialContextRef.current = tradeContext
  }

  return initialContextRef.current
}

type PlaceLimitOrderEventDeps = {
  inputAmount: CurrencyPreviewInfo['amount']
  outputAmount: CurrencyPreviewInfo['amount']
  limitRateActive: boolean
  account: string | undefined
  chainId: number | undefined
  tradeContext: TradeFlowContext
  executionPrice: ExecutionPriceLike
  partialFillsEnabled: boolean
}

function usePlaceLimitOrderEvent({
  inputAmount,
  outputAmount,
  limitRateActive,
  account,
  chainId,
  tradeContext,
  executionPrice,
  partialFillsEnabled,
}: PlaceLimitOrderEventDeps): string | undefined {
  return useMemo(() => {
    if (!inputAmount || !outputAmount || !limitRateActive) return undefined

    const walletAddress = account || undefined
    const resolvedChainId = chainId ?? tradeContext.postOrderParams.chainId
    const kind = tradeContext.postOrderParams.kind

    return buildPlaceLimitOrderEvent({
      inputAmount,
      outputAmount,
      kind,
      executionPrice,
      partialFillsEnabled,
      walletAddress,
      chainId: resolvedChainId,
    })
  }, [account, chainId, executionPrice, inputAmount, limitRateActive, outputAmount, partialFillsEnabled, tradeContext])
}

export interface LimitOrdersConfirmModalProps {
  tradeContext: TradeFlowContext
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
  recipient?: string | null
}

export function LimitOrdersConfirmModal(props: LimitOrdersConfirmModalProps): ReactNode {
  const { tradeConfirmationProps, renderConfirmationChildren } = useLimitOrdersConfirmViewModel(props)

  return (
    <TradeConfirmModal title={CONFIRM_TITLE}>
      <TradeConfirmation {...tradeConfirmationProps}>{renderConfirmationChildren}</TradeConfirmation>
    </TradeConfirmModal>
  )
}

interface LimitOrdersConfirmViewModel {
  tradeConfirmationProps: TradeConfirmationProps
  renderConfirmationChildren: (restContent: ReactElement) => ReactNode
}

function useLimitOrdersConfirmViewModel(props: LimitOrdersConfirmModalProps): LimitOrdersConfirmViewModel {
  const { inputCurrencyInfo, outputCurrencyInfo, tradeContext: tradeContextInitial, priceImpact, recipient } = props

  const tradeContext = useStableTradeContext(tradeContextInitial)
  const { account, chainId } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const warningsAccepted = useLimitOrdersWarningsAccepted(true)
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const executionPrice = useAtomValue(executionPriceAtom)
  const limitRateState = useAtomValue(limitRateAtom)
  const [partiallyFillableOverrideValue, setPartiallyFillableOverride] = useAtom(partiallyFillableOverrideAtom)
  const partiallyFillableOverride = useMemo<PartiallyFillableOverrideDispatcherType>(
    () => [partiallyFillableOverrideValue, setPartiallyFillableOverride],
    [partiallyFillableOverrideValue, setPartiallyFillableOverride],
  )

  const { amount: inputAmount } = inputCurrencyInfo
  const { amount: outputAmount } = outputCurrencyInfo

  const rateImpact = useRateImpact()
  const rateInfoParams = useRateInfoParams(inputAmount, outputAmount)
  const tradeConfirmActions = useTradeConfirmActions()
  const doTrade = useHandleOrderPlacement(tradeContext, priceImpact, settingsState, tradeConfirmActions)
  const isTooLowRate = rateImpact < LOW_RATE_THRESHOLD_PERCENT
  const isConfirmDisabled = isTooLowRate ? !warningsAccepted : false

  const isSafeApprovalBundle = useIsSafeApprovalBundle(inputAmount)
  const buttonText = !isSafeApprovalBundle || !inputAmount ? (
    DEFAULT_BUTTON_TEXT
  ) : (
    <>
      Confirm (Approve&nbsp;
      <TokenSymbol token={getWrappedToken(inputAmount.currency)} length={6} />
      &nbsp;& Limit order)
    </>
  )

  const partialFillsEnabledForAnalytics =
    partiallyFillableOverrideValue ??
    tradeContext.postOrderParams.partiallyFillable ??
    settingsState.partialFillsEnabled ??
    false

  const placeLimitOrderEvent = usePlaceLimitOrderEvent({
    inputAmount,
    outputAmount,
    limitRateActive: Boolean(limitRateState.activeRate),
    account,
    chainId,
    tradeContext,
    executionPrice,
    partialFillsEnabled: partialFillsEnabledForAnalytics,
  })

  const renderConfirmationChildren = useCallback(
    (restContent: ReactElement) =>
      LimitOrdersConfirmationChildren({
        tradeContext,
        limitRateState,
        rateInfoParams,
        settingsState,
        executionPrice,
        partiallyFillableOverride,
        restContent,
      }),
    [tradeContext, limitRateState, rateInfoParams, settingsState, executionPrice, partiallyFillableOverride],
  )

  const tradeConfirmationProps: TradeConfirmationProps = {
    title: CONFIRM_TITLE,
    account,
    ensName,
    inputCurrencyInfo,
    outputCurrencyInfo,
    onConfirm: doTrade,
    onDismiss: tradeConfirmActions.onDismiss,
    isConfirmDisabled,
    priceImpact,
    buttonText,
    recipient,
    appData: tradeContext.postOrderParams.appData || undefined,
    isPriceStatic: true,
    confirmClickEvent: placeLimitOrderEvent,
  }

  return { tradeConfirmationProps, renderConfirmationChildren }
}

interface LimitOrdersConfirmationChildrenProps {
  tradeContext: TradeFlowContext
  limitRateState: LimitOrdersDetailsProps['limitRateState']
  rateInfoParams: ReturnType<typeof useRateInfoParams>
  settingsState: LimitOrdersDetailsProps['settingsState']
  executionPrice: LimitOrdersDetailsProps['executionPrice']
  partiallyFillableOverride: PartiallyFillableOverrideDispatcherType
  restContent: ReactElement
}

function LimitOrdersConfirmationChildren({
  tradeContext,
  limitRateState,
  rateInfoParams,
  settingsState,
  executionPrice,
  partiallyFillableOverride,
  restContent,
}: LimitOrdersConfirmationChildrenProps): ReactNode {
  return (
    <>
      <LimitOrdersDetails
        limitRateState={limitRateState}
        tradeContext={tradeContext}
        rateInfoParams={rateInfoParams}
        settingsState={settingsState}
        executionPrice={executionPrice}
        partiallyFillableOverride={partiallyFillableOverride}
      >
        <TradeRateDetails />
      </LimitOrdersDetails>
      {restContent}
      <LimitOrdersWarnings isConfirmScreen={true} />
    </>
  )
}
