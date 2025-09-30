import { Dispatch, ReactNode, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { isSellOrder, isInjectedWidget } from '@cowprotocol/common-utils'
import { useIsSmartContractWallet, useWalletInfo, useIsEagerConnectInProgress } from '@cowprotocol/wallet'

import { Field } from 'legacy/state/types'
import { useHooksEnabledManager } from 'legacy/state/user/hooks'

import { useTryFindIntermediateToken } from 'modules/bridge'
import { EthFlowModal, EthFlowProps } from 'modules/ethFlow'
import { TradeWidgetSlots, useGetReceiveAmountInfo, useTradePriceImpact, useWrapNativeFlow } from 'modules/trade'
import type { TradeWidgetProps as TradeWidgetComponentProps } from 'modules/trade'
import { useHandleSwap } from 'modules/tradeFlow'
import { useTradeQuote } from 'modules/tradeQuote'
import { SettingsTab } from 'modules/tradeWidgetAddons'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { useSafeMemoObject } from 'common/hooks/useSafeMemo'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

import { useHasEnoughWrappedBalanceForSwap } from '../../../hooks/useHasEnoughWrappedBalanceForSwap'
import { useSwapDerivedState } from '../../../hooks/useSwapDerivedState'
import { useSwapDeadlineState, useSwapRecipientToggleState, useSwapSettings } from '../../../hooks/useSwapSettings'
import { useSwapWidgetActions } from '../../../hooks/useSwapWidgetActions'
import { useUpdateSwapRawState } from '../../../hooks/useUpdateSwapRawState'
import { CrossChainUnlockScreen } from '../../../pure/CrossChainUnlockScreen'
import { SwapConfirmModal } from '../../SwapConfirmModal'
import { SwapRateDetails } from '../../SwapRateDetails'
import { TradeButtons } from '../../TradeButtons'
import { Warnings } from '../../Warnings'

export interface SwapWidgetViewModel {
  showAddIntermediateTokenModal: boolean
  addIntermediateModalHandlers: AddIntermediateModalHandlers
  tradeWidgetProps: TradeWidgetComponentProps
}

export interface AddIntermediateModalHandlers {
  onDismiss: () => void
  onBack: () => void
  onImport: (token: TokenWithLogo) => void
}

export interface SwapWidgetPropsInternal {
  topContent?: ReactNode
  bottomContent?: ReactNode
}

interface CurrencyData {
  isSellTrade: boolean
  inputCurrencyInfo: CurrencyInfo
  outputCurrencyInfo: CurrencyInfo
  inputPreviewInfo: CurrencyPreviewInfo
  outputPreviewInfo: CurrencyPreviewInfo
  rateInfoParams: ReturnType<typeof useRateInfoParams>
  buyingFiatAmount: CurrencyInfo['fiatAmount']
}

interface CurrencyPreviewInfo {
  amount: CurrencyInfo['amount']
  fiatAmount: CurrencyInfo['fiatAmount']
  balance: CurrencyInfo['balance']
  label: string
}

interface LockScreenArgs {
  isHydrated: boolean
  isUnlocked: boolean
  isNetworkUnsupported: boolean
  account?: string
  isSmartContractWallet: boolean | undefined
  isEagerConnectInProgress: boolean
}

interface SlotArgs {
  topContent?: ReactNode
  bottomContent?: ReactNode
  shouldShowLockScreen: boolean
  handleUnlock: () => void
  recipientToggleState: ReturnType<typeof useSwapRecipientToggleState>
  hooksEnabledState: ReturnType<typeof useHooksEnabledManager>
  deadlineState: ReturnType<typeof useSwapDeadlineState>
  rateInfoParams: CurrencyData['rateInfoParams']
  buyingFiatAmount: CurrencyData['buyingFiatAmount']
  isTradeContextReady: boolean
  openNativeWrapModal: () => void
  hasEnoughWrappedBalanceForSwap: boolean
  toBeImported: ReturnType<typeof useTryFindIntermediateToken>['toBeImported']
  intermediateBuyToken: ReturnType<typeof useTryFindIntermediateToken>['intermediateBuyToken']
  setShowAddIntermediateTokenModal: Dispatch<SetStateAction<boolean>>
}

interface TradeParamsArgs {
  recipient: ReturnType<typeof useSwapDerivedState>['recipient']
  showRecipient: boolean
  isRateLoading: boolean
  priceImpact: ReturnType<typeof useTradePriceImpact>
}

interface TradePropsArgs {
  slots: TradeWidgetSlots
  widgetActions: ReturnType<typeof useSwapWidgetActions>
  params: TradeWidgetComponentProps['params']
  currencyData: CurrencyData
  priceImpact: ReturnType<typeof useTradePriceImpact>
  recipient: ReturnType<typeof useSwapDerivedState>['recipient']
  recipientAddress: ReturnType<typeof useSwapDerivedState>['recipientAddress']
  doTradeCallback: ReturnType<typeof useHandleSwap>['callback']
  showNativeWrapModal: boolean
  ethFlowProps: EthFlowProps
}

interface TradeContext {
  wrapCallback: ReturnType<typeof useWrapNativeFlow>
  updateSwapState: ReturnType<typeof useUpdateSwapRawState>
  derivedState: ReturnType<typeof useSwapDerivedState>
  doTrade: ReturnType<typeof useHandleSwap>
  hasEnoughWrappedBalanceForSwap: boolean
}

interface WidgetSettings {
  showRecipient: boolean
  deadlineState: ReturnType<typeof useSwapDeadlineState>
  recipientToggleState: ReturnType<typeof useSwapRecipientToggleState>
  hooksEnabledState: ReturnType<typeof useHooksEnabledManager>
}

interface WalletStatus {
  isSmartContractWallet: ReturnType<typeof useIsSmartContractWallet>
  account: ReturnType<typeof useWalletInfo>['account']
  isEagerConnectInProgress: ReturnType<typeof useIsEagerConnectInProgress>
  isNetworkUnsupported: boolean
}

export function useSwapWidgetViewModel({ topContent, bottomContent }: SwapWidgetPropsInternal): SwapWidgetViewModel {
  const { showRecipient, deadlineState, recipientToggleState, hooksEnabledState } = useWidgetSettings()
  const { isLoading: isRateLoading, bridgeQuote } = useTradeQuote()
  const priceImpact = useTradePriceImpact()
  const widgetActions = useSwapWidgetActions()
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const { intermediateBuyToken, toBeImported } = useTryFindIntermediateToken({ bridgeQuote })
  const {
    showNativeWrapModal,
    openNativeWrapModal,
    dismissNativeWrapModal,
    showAddIntermediateTokenModal,
    setShowAddIntermediateTokenModal,
    addIntermediateModalHandlers,
  } = useWidgetModals()
  const { derivedState, doTrade, hasEnoughWrappedBalanceForSwap, updateSwapState, wrapCallback } = useTradeContext(
    deadlineState,
    widgetActions,
  )
  const { handleUnlock, shouldShowLockScreen } = useLockScreenState(derivedState, updateSwapState)
  const currencyData = useCurrencyData(derivedState, receiveAmountInfo)
  const ethFlowProps: EthFlowProps = useSafeMemoObject({
    nativeInput: derivedState.inputCurrencyAmount || undefined,
    onDismiss: dismissNativeWrapModal,
    wrapCallback,
    directSwapCallback: doTrade.callback,
    hasEnoughWrappedBalanceForSwap,
  })
  const shouldShowAddIntermediateTokenModal = useIntermediateTokenModalVisibility({
    showAddIntermediateTokenModal,
    setShowAddIntermediateTokenModal,
    toBeImported,
    intermediateBuyToken,
  })
  const slots = useTradeWidgetSlotsMemo({
    topContent,
    bottomContent,
    shouldShowLockScreen,
    handleUnlock,
    recipientToggleState,
    hooksEnabledState,
    deadlineState,
    rateInfoParams: currencyData.rateInfoParams,
    buyingFiatAmount: currencyData.buyingFiatAmount,
    isTradeContextReady: doTrade.contextIsReady,
    openNativeWrapModal,
    hasEnoughWrappedBalanceForSwap,
    toBeImported,
    intermediateBuyToken,
    setShowAddIntermediateTokenModal,
  })
  const params = useTradeWidgetParamsMemo({
    recipient: derivedState.recipient,
    showRecipient,
    isRateLoading,
    priceImpact,
  })
  const tradeWidgetProps = useTradeWidgetPropsMemo({
    slots,
    widgetActions,
    params,
    currencyData,
    priceImpact,
    recipient: derivedState.recipient,
    recipientAddress: derivedState.recipientAddress,
    doTradeCallback: doTrade.callback,
    showNativeWrapModal,
    ethFlowProps,
  })

  return {
    showAddIntermediateTokenModal: shouldShowAddIntermediateTokenModal,
    addIntermediateModalHandlers,
    tradeWidgetProps,
  }
}

function useTradeContext(
  deadlineState: ReturnType<typeof useSwapDeadlineState>,
  widgetActions: ReturnType<typeof useSwapWidgetActions>,
): TradeContext {
  const wrapCallback = useWrapNativeFlow()
  const updateSwapState = useUpdateSwapRawState()
  const derivedState = useSwapDerivedState()
  const doTrade = useHandleSwap(useSafeMemoObject({ deadline: deadlineState[0] }), widgetActions)
  const hasEnoughWrappedBalanceForSwap = useHasEnoughWrappedBalanceForSwap()

  return useMemo(
    () => ({ wrapCallback, updateSwapState, derivedState, doTrade, hasEnoughWrappedBalanceForSwap }),
    [wrapCallback, updateSwapState, derivedState, doTrade, hasEnoughWrappedBalanceForSwap],
  )
}

function useCurrencyData(
  derivedState: ReturnType<typeof useSwapDerivedState>,
  receiveAmountInfo: ReturnType<typeof useGetReceiveAmountInfo>,
): CurrencyData {
  const isSellTrade = isSellOrder(derivedState.orderKind)
  const inputCurrencyInfo = useInputCurrencyInfo({ derivedState, isSellTrade, receiveAmountInfo })
  const outputCurrencyInfo = useOutputCurrencyInfo({ derivedState, isSellTrade, receiveAmountInfo })
  const inputPreviewInfo = useCurrencyPreviewInfo(
    inputCurrencyInfo,
    isSellTrade ? 'Sell amount' : 'Expected sell amount',
  )
  const outputPreviewInfo = useCurrencyPreviewInfo(
    outputCurrencyInfo,
    isSellTrade ? 'Receive (before fees)' : 'Buy exactly',
  )
  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)
  const buyingFiatAmount = useBuyingFiatAmount(isSellTrade, outputCurrencyInfo.fiatAmount, inputCurrencyInfo.fiatAmount)

  return useMemo(
    () => ({
      isSellTrade,
      inputCurrencyInfo,
      outputCurrencyInfo,
      inputPreviewInfo,
      outputPreviewInfo,
      rateInfoParams,
      buyingFiatAmount,
    }),
    [
      isSellTrade,
      inputCurrencyInfo,
      outputCurrencyInfo,
      inputPreviewInfo,
      outputPreviewInfo,
      rateInfoParams,
      buyingFiatAmount,
    ],
  )
}

function useInputCurrencyInfo({
  derivedState,
  isSellTrade,
  receiveAmountInfo,
}: {
  derivedState: ReturnType<typeof useSwapDerivedState>
  isSellTrade: boolean
  receiveAmountInfo: ReturnType<typeof useGetReceiveAmountInfo>
}): CurrencyInfo {
  return useMemo(
    () => ({
      field: Field.INPUT,
      currency: derivedState.inputCurrency,
      amount: derivedState.inputCurrencyAmount,
      isIndependent: isSellTrade,
      balance: derivedState.inputCurrencyBalance,
      fiatAmount: derivedState.inputCurrencyFiatAmount,
      receiveAmountInfo: isSellTrade ? null : receiveAmountInfo,
    }),
    [
      derivedState.inputCurrency,
      derivedState.inputCurrencyAmount,
      derivedState.inputCurrencyBalance,
      derivedState.inputCurrencyFiatAmount,
      isSellTrade,
      receiveAmountInfo,
    ],
  )
}

function useOutputCurrencyInfo({
  derivedState,
  isSellTrade,
  receiveAmountInfo,
}: {
  derivedState: ReturnType<typeof useSwapDerivedState>
  isSellTrade: boolean
  receiveAmountInfo: ReturnType<typeof useGetReceiveAmountInfo>
}): CurrencyInfo {
  return useMemo(
    () => ({
      field: Field.OUTPUT,
      currency: derivedState.outputCurrency,
      amount: derivedState.outputCurrencyAmount,
      isIndependent: !isSellTrade,
      balance: derivedState.outputCurrencyBalance,
      fiatAmount: derivedState.outputCurrencyFiatAmount,
      receiveAmountInfo: isSellTrade ? receiveAmountInfo : null,
    }),
    [
      derivedState.outputCurrency,
      derivedState.outputCurrencyAmount,
      derivedState.outputCurrencyBalance,
      derivedState.outputCurrencyFiatAmount,
      isSellTrade,
      receiveAmountInfo,
    ],
  )
}

function useCurrencyPreviewInfo(currencyInfo: CurrencyInfo, label: string): CurrencyPreviewInfo {
  return useMemo(
    () => ({
      amount: currencyInfo.amount,
      fiatAmount: currencyInfo.fiatAmount,
      balance: currencyInfo.balance,
      label,
    }),
    [currencyInfo.amount, currencyInfo.fiatAmount, currencyInfo.balance, label],
  )
}

function useBuyingFiatAmount(
  isSellTrade: boolean,
  outputFiatAmount: CurrencyInfo['fiatAmount'],
  inputFiatAmount: CurrencyInfo['fiatAmount'],
): CurrencyInfo['fiatAmount'] {
  return useMemo(
    () => (isSellTrade ? outputFiatAmount : inputFiatAmount),
    [isSellTrade, outputFiatAmount, inputFiatAmount],
  )
}

function useShouldShowLockScreen({
  isHydrated,
  isUnlocked,
  isNetworkUnsupported,
  account,
  isSmartContractWallet,
  isEagerConnectInProgress,
}: LockScreenArgs): boolean {
  return useMemo(() => {
    if (!isHydrated || isUnlocked || isNetworkUnsupported) return false
    if (isInjectedWidget()) return false
    const isConnected = Boolean(account)

    if (isConnected) {
      return isSmartContractWallet === false
    }

    return !isEagerConnectInProgress
  }, [isHydrated, isUnlocked, isNetworkUnsupported, account, isSmartContractWallet, isEagerConnectInProgress])
}

function useTradeWidgetSlotsMemo({
  topContent,
  bottomContent,
  shouldShowLockScreen,
  handleUnlock,
  recipientToggleState,
  hooksEnabledState,
  deadlineState,
  rateInfoParams,
  buyingFiatAmount,
  isTradeContextReady,
  openNativeWrapModal,
  hasEnoughWrappedBalanceForSwap,
  toBeImported,
  intermediateBuyToken,
  setShowAddIntermediateTokenModal,
}: SlotArgs): TradeWidgetSlots {
  const lockScreen = useMemo(
    () => (shouldShowLockScreen ? <CrossChainUnlockScreen handleUnlock={handleUnlock} /> : undefined),
    [shouldShowLockScreen, handleUnlock],
  )

  const settingsWidget = useMemo(
    () => (
      <SettingsTab
        recipientToggleState={recipientToggleState}
        hooksEnabledState={hooksEnabledState}
        deadlineState={deadlineState}
      />
    ),
    [recipientToggleState, hooksEnabledState, deadlineState],
  )

  const bottomContentRenderer = useCallback(
    (tradeWarnings: ReactNode | null) => (
      <>
        {bottomContent}
        <SwapRateDetails rateInfoParams={rateInfoParams} deadline={deadlineState[0]} />
        <Warnings buyingFiatAmount={buyingFiatAmount} />
        {tradeWarnings}
        <TradeButtons
          isTradeContextReady={isTradeContextReady}
          openNativeWrapModal={openNativeWrapModal}
          hasEnoughWrappedBalanceForSwap={hasEnoughWrappedBalanceForSwap}
          tokenToBeImported={toBeImported}
          intermediateBuyToken={intermediateBuyToken}
          setShowAddIntermediateTokenModal={setShowAddIntermediateTokenModal}
        />
      </>
    ),
    [
      bottomContent,
      rateInfoParams,
      deadlineState,
      buyingFiatAmount,
      isTradeContextReady,
      openNativeWrapModal,
      hasEnoughWrappedBalanceForSwap,
      toBeImported,
      intermediateBuyToken,
      setShowAddIntermediateTokenModal,
    ],
  )

  return useMemo(
    () => ({
      topContent,
      lockScreen,
      settingsWidget,
      bottomContent: bottomContentRenderer,
    }),
    [topContent, lockScreen, settingsWidget, bottomContentRenderer],
  )
}

function useTradeWidgetParamsMemo({
  recipient,
  showRecipient,
  isRateLoading,
  priceImpact,
}: TradeParamsArgs): TradeWidgetComponentProps['params'] {
  return useMemo(
    () => ({
      compactView: true,
      enableSmartSlippage: true,
      isMarketOrderWidget: true,
      isSellingEthSupported: true,
      recipient,
      showRecipient,
      isTradePriceUpdating: isRateLoading,
      priceImpact,
    }),
    [recipient, showRecipient, isRateLoading, priceImpact],
  )
}

function useTradeWidgetPropsMemo({
  slots,
  widgetActions,
  params,
  currencyData,
  priceImpact,
  recipient,
  recipientAddress,
  doTradeCallback,
  showNativeWrapModal,
  ethFlowProps,
}: TradePropsArgs): TradeWidgetComponentProps {
  const confirmModal = useMemo(
    () => (
      <SwapConfirmModal
        doTrade={doTradeCallback}
        recipient={recipient}
        recipientAddress={recipientAddress}
        priceImpact={priceImpact}
        inputCurrencyInfo={currencyData.inputPreviewInfo}
        outputCurrencyInfo={currencyData.outputPreviewInfo}
      />
    ),
    [
      doTradeCallback,
      recipient,
      recipientAddress,
      priceImpact,
      currencyData.inputPreviewInfo,
      currencyData.outputPreviewInfo,
    ],
  )

  const genericModal = useMemo(
    () => (showNativeWrapModal ? <EthFlowModal {...ethFlowProps} /> : undefined),
    [showNativeWrapModal, ethFlowProps],
  )

  return useMemo(
    () => ({
      slots,
      actions: widgetActions,
      params,
      inputCurrencyInfo: currencyData.inputCurrencyInfo,
      outputCurrencyInfo: currencyData.outputCurrencyInfo,
      confirmModal,
      genericModal,
    }),
    [
      slots,
      widgetActions,
      params,
      currencyData.inputCurrencyInfo,
      currencyData.outputCurrencyInfo,
      confirmModal,
      genericModal,
    ],
  )
}

function useWidgetSettings(): WidgetSettings {
  const { showRecipient } = useSwapSettings()
  const deadlineState = useSwapDeadlineState()
  const recipientToggleState = useSwapRecipientToggleState()
  const hooksEnabledState = useHooksEnabledManager()

  return useMemo(
    () => ({ showRecipient, deadlineState, recipientToggleState, hooksEnabledState }),
    [showRecipient, deadlineState, recipientToggleState, hooksEnabledState],
  )
}

function useWalletStatus(): WalletStatus {
  const isSmartContractWallet = useIsSmartContractWallet()
  const { account } = useWalletInfo()
  const isEagerConnectInProgress = useIsEagerConnectInProgress()
  const isNetworkUnsupported = useIsProviderNetworkUnsupported()

  return useMemo(
    () => ({ isSmartContractWallet, account, isEagerConnectInProgress, isNetworkUnsupported }),
    [isSmartContractWallet, account, isEagerConnectInProgress, isNetworkUnsupported],
  )
}

function useWidgetModals(): {
  showNativeWrapModal: boolean
  openNativeWrapModal: () => void
  dismissNativeWrapModal: () => void
  showAddIntermediateTokenModal: boolean
  setShowAddIntermediateTokenModal: Dispatch<SetStateAction<boolean>>
  addIntermediateModalHandlers: AddIntermediateModalHandlers
} {
  const [showNativeWrapModal, setShowNativeWrapModal] = useState(false)
  const [showAddIntermediateTokenModal, setShowAddIntermediateTokenModal] = useState(false)

  const openNativeWrapModal = useCallback(() => setShowNativeWrapModal(true), [])
  const dismissNativeWrapModal = useCallback(() => setShowNativeWrapModal(false), [])

  const addIntermediateModalHandlers = useMemo<AddIntermediateModalHandlers>(
    () => ({
      onDismiss: () => setShowAddIntermediateTokenModal(false),
      onBack: () => setShowAddIntermediateTokenModal(false),
      onImport: (_token) => setShowAddIntermediateTokenModal(false),
    }),
    [setShowAddIntermediateTokenModal],
  )

  return {
    showNativeWrapModal,
    openNativeWrapModal,
    dismissNativeWrapModal,
    showAddIntermediateTokenModal,
    setShowAddIntermediateTokenModal,
    addIntermediateModalHandlers,
  }
}

function useHydrationFlag(): boolean {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated
}

function useLockScreenState(
  derivedState: ReturnType<typeof useSwapDerivedState>,
  updateSwapState: ReturnType<typeof useUpdateSwapRawState>,
): {
  handleUnlock: () => void
  shouldShowLockScreen: boolean
} {
  const walletStatus = useWalletStatus()
  const isHydrated = useHydrationFlag()
  const handleUnlock = useCallback(() => updateSwapState({ isUnlocked: true }), [updateSwapState])

  const shouldShowLockScreen = useShouldShowLockScreen({
    isHydrated,
    isUnlocked: derivedState.isUnlocked,
    isNetworkUnsupported: walletStatus.isNetworkUnsupported,
    account: walletStatus.account,
    isSmartContractWallet: walletStatus.isSmartContractWallet,
    isEagerConnectInProgress: walletStatus.isEagerConnectInProgress,
  })

  return useMemo(
    () => ({ handleUnlock, shouldShowLockScreen }),
    [handleUnlock, shouldShowLockScreen],
  )
}

function useIntermediateTokenModalVisibility({
  showAddIntermediateTokenModal,
  setShowAddIntermediateTokenModal,
  toBeImported,
  intermediateBuyToken,
}: {
  showAddIntermediateTokenModal: boolean
  setShowAddIntermediateTokenModal: Dispatch<SetStateAction<boolean>>
  toBeImported: boolean
  intermediateBuyToken: TokenWithLogo | null
}): boolean {
  const hasIntermediateTokenToImport = Boolean(toBeImported || intermediateBuyToken)

  useEffect(() => {
    if (showAddIntermediateTokenModal && !hasIntermediateTokenToImport) {
      setShowAddIntermediateTokenModal(false)
    }
  }, [showAddIntermediateTokenModal, hasIntermediateTokenToImport, setShowAddIntermediateTokenModal])

  return showAddIntermediateTokenModal && hasIntermediateTokenToImport
}
