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
type PreviewAmount = CurrencyPreviewInfo['amount']

function buildLimitOrderButtonText(isSafeApprovalBundle: boolean, inputAmount: PreviewAmount): ReactNode {
  if (!isSafeApprovalBundle || !inputAmount) {
    return DEFAULT_BUTTON_TEXT
  }

  const wrappedToken = getWrappedToken(inputAmount.currency)

  return (
    <>
      Confirm (Approve&nbsp;
      <TokenSymbol token={wrappedToken} length={6} />
      &nbsp;& Limit order)
    </>
  )
}

function useStableTradeContext(tradeContext: TradeFlowContext): TradeFlowContext {
  const initialContextRef = useRef<TradeFlowContext | null>(null)

  if (!initialContextRef.current) {
    initialContextRef.current = tradeContext
  }

  return initialContextRef.current
}

function resolvePartialFillFlag(
  overrideValue: boolean | undefined,
  tradeContext: TradeFlowContext,
  settingsState: LimitOrdersDetailsProps['settingsState'],
): boolean {
  return overrideValue ?? tradeContext.postOrderParams.partiallyFillable ?? settingsState.partialFillsEnabled ?? false
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
  const { amount: inputAmount } = inputCurrencyInfo
  const { amount: outputAmount } = outputCurrencyInfo

  const rateImpact = useRateImpact()
  const rateInfoParams = useRateInfoParams(inputAmount, outputAmount)
  const tradeConfirmActions = useTradeConfirmActions()
  const doTrade = useHandleOrderPlacement(tradeContext, priceImpact, settingsState, tradeConfirmActions)
  const isTooLowRate = rateImpact < LOW_RATE_THRESHOLD_PERCENT
  const isConfirmDisabled = isTooLowRate ? !warningsAccepted : false

  const isSafeApprovalBundle = useIsSafeApprovalBundle(inputAmount)
  const buttonText = buildLimitOrderButtonText(isSafeApprovalBundle, inputAmount)

  const partialFillsEnabledForAnalytics = resolvePartialFillFlag(
    partiallyFillableOverrideValue,
    tradeContext,
    settingsState,
  )

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
        partiallyFillableOverride: [partiallyFillableOverrideValue, setPartiallyFillableOverride],
        restContent,
      }),
    [
      tradeContext,
      limitRateState,
      rateInfoParams,
      settingsState,
      executionPrice,
      partiallyFillableOverrideValue,
      setPartiallyFillableOverride,
    ],
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
