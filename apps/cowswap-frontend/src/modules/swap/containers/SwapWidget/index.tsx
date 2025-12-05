import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isInjectedWidget, isSellOrder } from '@cowprotocol/common-utils'
import { useIsEagerConnectInProgress, useIsSmartContractWallet, useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'

import { Field } from 'legacy/state/types'
import { useHooksEnabledManager } from 'legacy/state/user/hooks'

import { useTryFindIntermediateToken } from 'modules/bridge'
import { TradeApproveWithAffectedOrderList } from 'modules/erc20Approve'
import { EthFlowModal, EthFlowProps } from 'modules/ethFlow'
import { SELL_ETH_RESET_STATE } from 'modules/swap/consts'
import { AddIntermediateTokenModal } from 'modules/tokensList'
import {
  TradeWidget,
  TradeWidgetSlots,
  useGetReceiveAmountInfo,
  useIsEoaEthFlow,
  useTradePriceImpact,
  useWrapNativeFlow,
} from 'modules/trade'
import { useHandleSwap } from 'modules/tradeFlow'
import { useIsTradeFormValidationPassed } from 'modules/tradeFormValidation'
import { useTradeQuote } from 'modules/tradeQuote'
import { SettingsTab } from 'modules/tradeWidgetAddons'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { useSafeMemoObject } from 'common/hooks/useSafeMemo'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

import { Container } from './styled'

import { useHasEnoughWrappedBalanceForSwap } from '../../hooks/useHasEnoughWrappedBalanceForSwap'
import { useSwapDerivedState } from '../../hooks/useSwapDerivedState'
import {
  useSwapDeadlineState,
  useSwapPartialApprovalToggleState,
  useSwapRecipientToggleState,
  useSwapSettings,
} from '../../hooks/useSwapSettings'
import { useSwapWidgetActions } from '../../hooks/useSwapWidgetActions'
import { useUpdateSwapRawState } from '../../hooks/useUpdateSwapRawState'
import { CrossChainUnlockScreen } from '../../pure/CrossChainUnlockScreen'
import { BottomBanners } from '../BottomBanners'
import { SwapConfirmModal } from '../SwapConfirmModal'
import { SwapRateDetails } from '../SwapRateDetails'
import { TradeButtons } from '../TradeButtons'
import { Warnings } from '../Warnings'

export interface SwapWidgetProps {
  topContent?: ReactNode
  bottomContent?: ReactNode
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function,complexity
export function SwapWidget({ topContent, bottomContent }: SwapWidgetProps): ReactNode {
  const { showRecipient } = useSwapSettings()
  const deadlineState = useSwapDeadlineState()
  const recipientToggleState = useSwapRecipientToggleState()
  const hooksEnabledState = useHooksEnabledManager()
  const { isLoading: isRateLoading, bridgeQuote } = useTradeQuote()
  const priceImpact = useTradePriceImpact()
  const widgetActions = useSwapWidgetActions()
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const { intermediateBuyToken, toBeImported } = useTryFindIntermediateToken({ bridgeQuote })
  const [showNativeWrapModal, setOpenNativeWrapModal] = useState(false)
  const [showAddIntermediateTokenModal, setShowAddIntermediateTokenModal] = useState(false)

  const openNativeWrapModal = useCallback(() => setOpenNativeWrapModal(true), [])
  const dismissNativeWrapModal = useCallback(() => setOpenNativeWrapModal(false), [])

  const wrapCallback = useWrapNativeFlow()
  const updateSwapState = useUpdateSwapRawState()

  const {
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount,
    outputCurrencyAmount,
    inputCurrencyBalance,
    outputCurrencyBalance,
    inputCurrencyFiatAmount,
    outputCurrencyFiatAmount,
    recipient,
    recipientAddress,
    orderKind,
    isUnlocked,
  } = useSwapDerivedState()
  const doTrade = useHandleSwap({ deadline: deadlineState[0] }, widgetActions)
  const hasEnoughWrappedBalanceForSwap = useHasEnoughWrappedBalanceForSwap()
  const isSmartContractWallet = useIsSmartContractWallet()
  const { account } = useWalletInfo()
  const isEagerConnectInProgress = useIsEagerConnectInProgress()
  const [isHydrated, setIsHydrated] = useState(false)
  const handleUnlock = useCallback(() => updateSwapState({ isUnlocked: true }), [updateSwapState])
  const isPrimaryValidationPassed = useIsTradeFormValidationPassed()
  const isEoaEthFlow = useIsEoaEthFlow()

  useEffect(() => {
    // Hydration guard: defer lock-screen until persisted state (isUnlocked) loads to prevent initial flash.
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isEoaEthFlow && !isSellOrder(orderKind)) {
      updateSwapState(SELL_ETH_RESET_STATE)
    }
  }, [isEoaEthFlow, orderKind, updateSwapState])

  const isSellTrade = isSellOrder(orderKind)

  const ethFlowProps: EthFlowProps = useSafeMemoObject({
    nativeInput: inputCurrencyAmount || undefined,
    onDismiss: dismissNativeWrapModal,
    wrapCallback,
    directSwapCallback: doTrade.callback,
    hasEnoughWrappedBalanceForSwap,
  })

  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    currency: inputCurrency,
    amount: inputCurrencyAmount,
    isIndependent: isSellTrade,
    balance: inputCurrencyBalance,
    fiatAmount: inputCurrencyFiatAmount,
    receiveAmountInfo: !isSellTrade ? receiveAmountInfo : null,
  }

  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    currency: outputCurrency,
    amount: outputCurrencyAmount,
    isIndependent: !isSellTrade,
    balance: outputCurrencyBalance,
    fiatAmount: outputCurrencyFiatAmount,
    receiveAmountInfo: isSellTrade ? receiveAmountInfo : null,
  }

  const inputCurrencyPreviewInfo = {
    amount: inputCurrencyInfo.amount,
    fiatAmount: inputCurrencyInfo.fiatAmount,
    balance: inputCurrencyInfo.balance,
    label: isSellTrade ? t`Sell amount` : t`Expected sell amount`,
  }

  const outputCurrencyPreviewInfo = {
    amount: outputCurrencyInfo.amount,
    fiatAmount: outputCurrencyInfo.fiatAmount,
    balance: outputCurrencyInfo.balance,
    label: isSellTrade ? t`Receive (before fees)` : t`Buy exactly`,
  }

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)

  const buyingFiatAmount = useMemo(
    () => (isSellTrade ? outputCurrencyInfo.fiatAmount : inputCurrencyInfo.fiatAmount),
    [isSellTrade, outputCurrencyInfo.fiatAmount, inputCurrencyInfo.fiatAmount],
  )

  const handleImport = useCallback(() => {
    setShowAddIntermediateTokenModal(false)
  }, [])

  const handleCloseImportModal = useCallback(() => {
    setShowAddIntermediateTokenModal(false)
  }, [])

  const { isPartialApproveEnabled } = useFeatureFlags()
  const enablePartialApprovalState = useSwapPartialApprovalToggleState(isPartialApproveEnabled)

  const isConnected = Boolean(account)
  const isNetworkUnsupported = useIsProviderNetworkUnsupported()

  // Guarded render: require hydration and no active eager-connect; show only for confirmed EOAs or truly disconnected users.
  const shouldShowLockScreen =
    isHydrated &&
    !isUnlocked &&
    !isNetworkUnsupported &&
    !isInjectedWidget() &&
    ((isConnected && isSmartContractWallet === false) || (!isConnected && !isEagerConnectInProgress))

  const slots: TradeWidgetSlots = {
    topContent,
    lockScreen: shouldShowLockScreen ? <CrossChainUnlockScreen handleUnlock={handleUnlock} /> : undefined,
    settingsWidget: (
      <SettingsTab
        recipientToggleState={recipientToggleState}
        hooksEnabledState={hooksEnabledState}
        deadlineState={deadlineState}
        enablePartialApprovalState={enablePartialApprovalState}
      />
    ),
    bottomContent: useCallback(
      (tradeWarnings: ReactNode | null) => {
        return (
          <>
            {bottomContent}
            <SwapRateDetails rateInfoParams={rateInfoParams} deadline={deadlineState[0]} />
            {isPrimaryValidationPassed && isPartialApproveEnabled && <TradeApproveWithAffectedOrderList />}
            <Warnings buyingFiatAmount={buyingFiatAmount} />
            {tradeWarnings}
            <TradeButtons
              isTradeContextReady={doTrade.contextIsReady}
              openNativeWrapModal={openNativeWrapModal}
              hasEnoughWrappedBalanceForSwap={hasEnoughWrappedBalanceForSwap}
              tokenToBeImported={toBeImported}
              intermediateBuyToken={intermediateBuyToken}
              setShowAddIntermediateTokenModal={setShowAddIntermediateTokenModal}
            />
          </>
        )
      },
      [
        bottomContent,
        rateInfoParams,
        deadlineState,
        buyingFiatAmount,
        doTrade.contextIsReady,
        openNativeWrapModal,
        hasEnoughWrappedBalanceForSwap,
        toBeImported,
        intermediateBuyToken,
        isPrimaryValidationPassed,
        isPartialApproveEnabled,
      ],
    ),
  }

  const params = {
    compactView: true,
    enableSmartSlippage: true,
    isMarketOrderWidget: true,
    isSellingEthSupported: true,
    recipient,
    showRecipient,
    isTradePriceUpdating: isRateLoading,
    priceImpact,
  }

  return (
    <Container>
      {showAddIntermediateTokenModal ? (
        <AddIntermediateTokenModal
          onDismiss={handleCloseImportModal}
          onBack={handleCloseImportModal}
          onImport={handleImport}
        />
      ) : (
        <TradeWidget
          slots={slots}
          actions={widgetActions}
          params={params}
          inputCurrencyInfo={inputCurrencyInfo}
          outputCurrencyInfo={outputCurrencyInfo}
          confirmModal={
            <SwapConfirmModal
              doTrade={doTrade.callback}
              recipient={recipient}
              recipientAddress={recipientAddress}
              priceImpact={priceImpact}
              inputCurrencyInfo={inputCurrencyPreviewInfo}
              outputCurrencyInfo={outputCurrencyPreviewInfo}
            />
          }
          genericModal={showNativeWrapModal && <EthFlowModal {...ethFlowProps} />}
        />
      )}
      <BottomBanners />
    </Container>
  )
}
