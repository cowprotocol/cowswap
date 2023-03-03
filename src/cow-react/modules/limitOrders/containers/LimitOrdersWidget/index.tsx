import { useWeb3React } from '@web3-react/core'
import * as styledEl from './styled'
import { Field } from 'state/swap/actions'
import { CurrencyInputPanel } from '@cow/common/pure/CurrencyInputPanel'
import { CurrencyArrowSeparator } from '@cow/common/pure/CurrencyArrowSeparator'
import { AddRecipient } from '@cow/common/pure/AddRecipient'
import React, { useCallback, useMemo, useState } from 'react'
import { BalanceAndSubsidy } from 'hooks/useCowBalanceAndSubsidy'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/types'
import { useLimitOrdersTradeState } from '../../hooks/useLimitOrdersTradeState'
import { limitOrdersAtom, updateLimitOrdersAtom } from '../../state/limitOrdersAtom'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { SettingsWidget } from '../SettingsWidget'
import { limitOrdersSettingsAtom } from '../../state/limitOrdersSettingsAtom'
import { RateInput } from '../RateInput'
import { DeadlineInput } from '../DeadlineInput'
import { useUpdateCurrencyAmount } from '../../hooks/useUpdateCurrencyAmount'
import { LimitOrdersConfirmModal } from '../LimitOrdersConfirmModal'
import { useTradeFlowContext } from '../../hooks/useTradeFlowContext'
import { useIsSellOrder } from '../../hooks/useIsSellOrder'
import { TradeButtons } from '@cow/modules/limitOrders/containers/TradeButtons'
import { TradeApproveWidget } from '@cow/common/containers/TradeApprove/TradeApproveWidget'
import { useSetupTradeState } from '@cow/modules/trade'
import { useTradeNavigate } from '@cow/modules/trade/hooks/useTradeNavigate'
import { ImportTokenModal } from '@cow/modules/trade/containers/ImportTokenModal'
import { useOnImportDismiss } from '@cow/modules/trade/hooks/useOnImportDismiss'
import { limitRateAtom } from '../../state/limitRateAtom'
import { TradeWidgetLinks } from '@cow/modules/application/containers/TradeWidgetLinks'
import { useDisableNativeTokenSelling } from '@cow/modules/limitOrders/hooks/useDisableNativeTokenSelling'
import { useRateInfoParams } from '@cow/common/hooks/useRateInfoParams'
import { UnlockLimitOrders } from '../../pure/UnlockLimitOrders'
import usePriceImpact from 'hooks/usePriceImpact'
import { LimitOrdersWarnings } from '@cow/modules/limitOrders/containers/LimitOrdersWarnings'
import { useLimitOrdersPriceImpactParams } from '@cow/modules/limitOrders/hooks/useLimitOrdersPriceImpactParams'
import { OrderKind } from '@cowprotocol/contracts'
import { useThrottleFn } from '@cow/common/hooks/useThrottleFn'
import { useWalletInfo } from '@cow/modules/wallet'
import { useDetectNativeToken } from '@cow/modules/swap/hooks/useDetectNativeToken'
import { LimitOrdersProps, limitOrdersPropsChecker } from './limitOrdersPropsChecker'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useOnCurrencySelection } from '@cow/modules/limitOrders/hooks/useOnCurrencySelection'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { FractionUtils } from '@cow/utils/fractionUtils'
import { useSetupLimitOrderAmountsFromUrl } from '@cow/modules/limitOrders/hooks/useSetupLimitOrderAmountsFromUrl'
import AffiliateStatusCheck from 'components/AffiliateStatusCheck'
import { formatInputAmount } from '@cow/utils/amountFormat'

export function LimitOrdersWidget() {
  useSetupTradeState()
  useSetupLimitOrderAmountsFromUrl()
  useDisableNativeTokenSelling()

  const { chainId } = useWeb3React()
  const { allowsOffchainSigning } = useWalletInfo()
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
    isUnlocked,
    orderKind,
  } = useLimitOrdersTradeState()
  const onCurrencySelection = useOnCurrencySelection()
  const onImportDismiss = useOnImportDismiss()
  const limitOrdersNavigate = useTradeNavigate()
  const settingState = useAtomValue(limitOrdersSettingsAtom)
  const updateCurrencyAmount = useUpdateCurrencyAmount()
  const isSellOrder = useIsSellOrder()
  const tradeContext = useTradeFlowContext()
  const state = useAtomValue(limitOrdersAtom)
  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersAtom)
  const { isLoading: isRateLoading, activeRate } = useAtomValue(limitRateAtom)
  const rateInfoParams = useRateInfoParams(inputCurrencyAmount, outputCurrencyAmount)
  const { isWrapOrUnwrap } = useDetectNativeToken()

  const showRecipient = useMemo(
    () => !isWrapOrUnwrap && settingState.showRecipient,
    [settingState.showRecipient, isWrapOrUnwrap]
  )
  const priceImpact = usePriceImpact(useLimitOrdersPriceImpactParams())
  const inputViewAmount = formatInputAmount(inputCurrencyAmount, inputCurrencyBalance, orderKind === OrderKind.SELL)

  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    label: isWrapOrUnwrap ? undefined : isSellOrder ? 'You sell' : 'You sell at most',
    currency: inputCurrency,
    rawAmount: inputCurrencyAmount,
    viewAmount: inputViewAmount,
    balance: inputCurrencyBalance,
    fiatAmount: inputCurrencyFiatAmount,
    receiveAmountInfo: null,
  }
  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    label: isWrapOrUnwrap ? undefined : isSellOrder ? 'You receive at least' : 'You receive exactly',
    currency: outputCurrency,
    rawAmount: isWrapOrUnwrap ? inputCurrencyAmount : outputCurrencyAmount,
    viewAmount: isWrapOrUnwrap
      ? inputViewAmount
      : formatInputAmount(outputCurrencyAmount, outputCurrencyBalance, orderKind === OrderKind.BUY),
    balance: outputCurrencyBalance,
    fiatAmount: outputCurrencyFiatAmount,
    receiveAmountInfo: null,
  }
  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      const currency = field === Field.INPUT ? inputCurrency : outputCurrency

      if (!currency) return

      const value = tryParseCurrencyAmount(typedValue, currency) || null

      updateCurrencyAmount({
        activeRate,
        amount: value,
        orderKind: isWrapOrUnwrap || field === Field.INPUT ? OrderKind.SELL : OrderKind.BUY,
      })
    },
    [updateCurrencyAmount, isWrapOrUnwrap, inputCurrency, outputCurrency, activeRate]
  )

  const onSwitchTokens = useCallback(() => {
    const { inputCurrencyId, outputCurrencyId } = state

    if (!isWrapOrUnwrap) {
      updateLimitOrdersState({
        inputCurrencyId: outputCurrencyId,
        outputCurrencyId: inputCurrencyId,
        inputCurrencyAmount: FractionUtils.serializeFractionToJSON(outputCurrencyAmount),
        outputCurrencyAmount: FractionUtils.serializeFractionToJSON(inputCurrencyAmount),
        orderKind: orderKind === OrderKind.SELL ? OrderKind.BUY : OrderKind.SELL,
      })
    }
    limitOrdersNavigate(chainId, { inputCurrencyId: outputCurrencyId, outputCurrencyId: inputCurrencyId })
  }, [
    state,
    isWrapOrUnwrap,
    limitOrdersNavigate,
    updateLimitOrdersState,
    chainId,
    inputCurrencyAmount,
    outputCurrencyAmount,
    orderKind,
  ])

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      updateLimitOrdersState({ recipient })
    },
    [updateLimitOrdersState]
  )

  const props: LimitOrdersProps = {
    inputCurrencyInfo,
    outputCurrencyInfo,
    isUnlocked,
    isRateLoading,
    allowsOffchainSigning,
    isWrapOrUnwrap,
    showRecipient,
    recipient,
    chainId,
    onChangeRecipient,
    onUserInput,
    onSwitchTokens,
    onCurrencySelection,
    onImportDismiss,
    rateInfoParams,
    priceImpact,
    tradeContext,
  }

  return <LimitOrders {...props} />
}

const LimitOrders = React.memo((props: LimitOrdersProps) => {
  const {
    inputCurrencyInfo,
    outputCurrencyInfo,
    isUnlocked,
    chainId,
    isRateLoading,
    onUserInput,
    onSwitchTokens,
    onCurrencySelection,
    onImportDismiss,
    allowsOffchainSigning,
    isWrapOrUnwrap,
    showRecipient,
    recipient,
    onChangeRecipient,
    rateInfoParams,
    priceImpact,
    tradeContext,
  } = props

  const inputCurrency = inputCurrencyInfo.currency
  const outputCurrency = outputCurrencyInfo.currency

  const isTradePriceUpdating = useMemo(() => {
    if (isWrapOrUnwrap || !inputCurrency || !outputCurrency) return false

    return isRateLoading
  }, [isRateLoading, isWrapOrUnwrap, inputCurrency, outputCurrency])

  const currenciesLoadingInProgress = false
  const maxBalance = maxAmountSpend(inputCurrencyInfo.balance || undefined)
  const showSetMax = !!maxBalance && !inputCurrencyInfo.rawAmount?.equalTo(maxBalance)

  const subsidyAndBalance: BalanceAndSubsidy = {
    subsidy: {
      tier: 0,
      discount: 0,
    },
  }

  // Disable too frequent tokens switching
  const throttledOnSwitchTokens = useThrottleFn(onSwitchTokens, 500)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersAtom)

  console.debug('RENDER LIMIT ORDERS WIDGET', { inputCurrencyInfo, outputCurrencyInfo })

  return (
    <>
      <styledEl.Container>
        <AffiliateStatusCheck />
        <styledEl.ContainerBox>
          <styledEl.Header>
            <TradeWidgetLinks />
            {isUnlocked && <SettingsWidget />}
          </styledEl.Header>

          {isUnlocked ? (
            <>
              <CurrencyInputPanel
                id="limit-orders-currency-input"
                disableNonToken={false}
                chainId={chainId}
                loading={currenciesLoadingInProgress}
                onCurrencySelection={onCurrencySelection}
                onUserInput={onUserInput}
                subsidyAndBalance={subsidyAndBalance}
                allowsOffchainSigning={allowsOffchainSigning}
                currencyInfo={inputCurrencyInfo}
                showSetMax={showSetMax}
                topLabel={inputCurrencyInfo.label}
              />
              {!isWrapOrUnwrap && (
                <styledEl.RateWrapper>
                  <RateInput />
                  <DeadlineInput />
                </styledEl.RateWrapper>
              )}
              <styledEl.CurrencySeparatorBox withRecipient={showRecipient}>
                <CurrencyArrowSeparator
                  isCollapsed={false}
                  onSwitchTokens={throttledOnSwitchTokens}
                  withRecipient={showRecipient}
                  isLoading={isTradePriceUpdating}
                  hasSeparatorLine={true}
                  border={true}
                />
                {showRecipient && recipient === null && <AddRecipient onChangeRecipient={onChangeRecipient} />}
              </styledEl.CurrencySeparatorBox>
              <CurrencyInputPanel
                id="limit-orders-currency-output"
                disableNonToken={false}
                chainId={chainId}
                loading={currenciesLoadingInProgress}
                isRateLoading={isRateLoading}
                onCurrencySelection={onCurrencySelection}
                onUserInput={onUserInput}
                subsidyAndBalance={subsidyAndBalance}
                allowsOffchainSigning={allowsOffchainSigning}
                currencyInfo={outputCurrencyInfo}
                priceImpactParams={priceImpact}
                topLabel={outputCurrencyInfo.label}
              />
              {recipient !== null && (
                <styledEl.StyledRemoveRecipient recipient={recipient} onChangeRecipient={onChangeRecipient} />
              )}

              {!isWrapOrUnwrap && (
                <styledEl.FooterBox>
                  <styledEl.StyledRateInfo rateInfoParams={rateInfoParams} />
                </styledEl.FooterBox>
              )}

              <LimitOrdersWarnings priceImpact={priceImpact} />

              <styledEl.TradeButtonBox>
                <TradeButtons
                  inputCurrencyAmount={inputCurrencyInfo.rawAmount}
                  tradeContext={tradeContext}
                  priceImpact={priceImpact}
                  openConfirmScreen={() => setShowConfirmation(true)}
                />
              </styledEl.TradeButtonBox>
            </>
          ) : (
            <UnlockLimitOrders handleUnlock={() => updateLimitOrdersState({ isUnlocked: true })} />
          )}
        </styledEl.ContainerBox>
      </styledEl.Container>
      <TradeApproveWidget />
      {tradeContext && (
        <LimitOrdersConfirmModal
          isOpen={showConfirmation}
          tradeContext={tradeContext}
          priceImpact={priceImpact}
          inputCurrencyInfo={inputCurrencyInfo}
          outputCurrencyInfo={outputCurrencyInfo}
          onDismiss={() => setShowConfirmation(false)}
        />
      )}
      {chainId && <ImportTokenModal chainId={chainId} onDismiss={onImportDismiss} />}
    </>
  )
}, limitOrdersPropsChecker)
