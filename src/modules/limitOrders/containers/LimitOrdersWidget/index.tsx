import * as styledEl from './styled'
import { Field } from 'state/swap/actions'
import React, { useMemo, useState } from 'react'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'
import { useFillLimitOrdersDerivedState, useLimitOrdersDerivedState } from '../../hooks/useLimitOrdersDerivedState'
import { updateLimitOrdersRawStateAtom } from '../../state/limitOrdersRawStateAtom'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { SettingsWidget } from '../SettingsWidget'
import { limitOrdersSettingsAtom } from '../../state/limitOrdersSettingsAtom'
import { RateInput } from '../RateInput'
import { DeadlineInput } from '../DeadlineInput'
import { LimitOrdersConfirmModal } from '../LimitOrdersConfirmModal'
import { useTradeFlowContext } from '../../hooks/useTradeFlowContext'
import { useIsSellOrder } from '../../hooks/useIsSellOrder'
import { TradeButtons } from 'modules/limitOrders/containers/TradeButtons'
import { TradeApproveWidget } from 'common/containers/TradeApprove/TradeApproveWidget'
import { useSetupTradeState } from 'modules/trade'
import { ImportTokenModal } from 'modules/trade/containers/ImportTokenModal'
import { useOnImportDismiss } from 'modules/trade/hooks/useOnImportDismiss'
import { limitRateAtom } from '../../state/limitRateAtom'
import { useDisableNativeTokenSelling } from 'modules/limitOrders/hooks/useDisableNativeTokenSelling'
import { UnlockLimitOrders } from '../../pure/UnlockLimitOrders'
import { LimitOrdersWarnings } from 'modules/limitOrders/containers/LimitOrdersWarnings'
import { useLimitOrdersPriceImpactParams } from 'modules/limitOrders/hooks/useLimitOrdersPriceImpactParams'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from 'modules/wallet'
import { LimitOrdersProps, limitOrdersPropsChecker } from './limitOrdersPropsChecker'
import { useSetupLimitOrderAmountsFromUrl } from 'modules/limitOrders/hooks/useSetupLimitOrderAmountsFromUrl'
import { InfoBanner } from 'modules/limitOrders/pure/InfoBanner'
import { partiallyFillableOverrideAtom } from 'modules/limitOrders/state/partiallyFillableOverride'
import { useAtom } from 'jotai'
import { useFeatureFlags } from 'common/hooks/useFeatureFlags'
import { TradeWidget } from 'modules/trade/containers/TradeWidget'
import usePriceImpact from 'legacy/hooks/usePriceImpact'
import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { useLimitOrdersWidgetActions } from 'modules/limitOrders/containers/LimitOrdersWidget/hooks/useLimitOrdersWidgetActions'
import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'

export function LimitOrdersWidget() {
  useSetupTradeState()
  useSetupLimitOrderAmountsFromUrl()
  useDisableNativeTokenSelling()
  useFillLimitOrdersDerivedState()

  const { chainId } = useWalletInfo()
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
  } = useLimitOrdersDerivedState()
  const onImportDismiss = useOnImportDismiss()
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const isSellOrder = useIsSellOrder()
  const tradeContext = useTradeFlowContext()
  const { isLoading: isRateLoading, feeAmount } = useAtomValue(limitRateAtom)
  const rateInfoParams = useRateInfoParams(inputCurrencyAmount, outputCurrencyAmount)
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const partiallyFillableOverride = useAtom(partiallyFillableOverrideAtom)
  const { partialFillsEnabled } = useFeatureFlags()
  const widgetActions = useLimitOrdersWidgetActions()

  const showRecipient = useMemo(
    () => !isWrapOrUnwrap && settingsState.showRecipient,
    [settingsState.showRecipient, isWrapOrUnwrap]
  )

  const isExpertMode = useMemo(
    () => !isWrapOrUnwrap && settingsState.expertMode,
    [isWrapOrUnwrap, settingsState.expertMode]
  )

  const priceImpact = usePriceImpact(useLimitOrdersPriceImpactParams())

  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    label: isWrapOrUnwrap ? undefined : isSellOrder ? 'You sell' : 'You sell at most',
    currency: inputCurrency,
    amount: inputCurrencyAmount,
    isIndependent: orderKind === OrderKind.SELL,
    balance: inputCurrencyBalance,
    fiatAmount: inputCurrencyFiatAmount,
    receiveAmountInfo: null,
  }
  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    label: isWrapOrUnwrap ? undefined : isSellOrder ? 'You receive at least' : 'You receive exactly',
    currency: outputCurrency,
    amount: isWrapOrUnwrap ? inputCurrencyAmount : outputCurrencyAmount,
    isIndependent: orderKind === OrderKind.BUY,
    balance: outputCurrencyBalance,
    fiatAmount: outputCurrencyFiatAmount,
    receiveAmountInfo: null,
  }

  const props: LimitOrdersProps = {
    inputCurrencyInfo,
    outputCurrencyInfo,
    isUnlocked,
    isRateLoading,
    isWrapOrUnwrap,
    showRecipient,
    isExpertMode,
    recipient,
    chainId,
    onImportDismiss,
    partiallyFillableOverride,
    featurePartialFillsEnabled: partialFillsEnabled,
    rateInfoParams,
    priceImpact,
    tradeContext,
    settingsState,
    feeAmount,
    widgetActions,
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
    widgetActions,
    onImportDismiss,
    partiallyFillableOverride,
    featurePartialFillsEnabled,
    isWrapOrUnwrap,
    showRecipient,
    isExpertMode,
    recipient,
    rateInfoParams,
    priceImpact,
    tradeContext,
    settingsState,
    feeAmount,
  } = props

  const inputCurrency = inputCurrencyInfo.currency
  const outputCurrency = outputCurrencyInfo.currency

  const isTradePriceUpdating = useMemo(() => {
    if (isWrapOrUnwrap || !inputCurrency || !outputCurrency) return false

    return isRateLoading
  }, [isRateLoading, isWrapOrUnwrap, inputCurrency, outputCurrency])

  const isPartiallyFillable = featurePartialFillsEnabled && settingsState.partialFillsEnabled

  const [showConfirmation, setShowConfirmation] = useState(false)
  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersRawStateAtom)

  console.debug('RENDER LIMIT ORDERS WIDGET', { inputCurrencyInfo, outputCurrencyInfo })

  const slots = {
    settingsWidget: <SettingsWidget />,
    lockScreen: isUnlocked ? undefined : (
      <UnlockLimitOrders handleUnlock={() => updateLimitOrdersState({ isUnlocked: true })} />
    ),
    middleContent: (
      <styledEl.RateWrapper>
        <RateInput />
        <DeadlineInput />
      </styledEl.RateWrapper>
    ),
    bottomContent: (
      <>
        {!isWrapOrUnwrap && (
          <styledEl.FooterBox>
            <styledEl.StyledRateInfo rateInfoParams={rateInfoParams} />
          </styledEl.FooterBox>
        )}

        {isExpertMode && (
          <styledEl.FooterBox>
            <styledEl.StyledOrderType
              isPartiallyFillable={isPartiallyFillable}
              partiallyFillableOverride={partiallyFillableOverride}
              featurePartialFillsEnabled={featurePartialFillsEnabled}
            />
          </styledEl.FooterBox>
        )}

        {!isWrapOrUnwrap && <LimitOrdersWarnings priceImpact={priceImpact} feeAmount={feeAmount} />}

        <styledEl.TradeButtonBox>
          <TradeButtons
            inputCurrencyAmount={inputCurrencyInfo.amount}
            tradeContext={tradeContext}
            priceImpact={priceImpact}
            openConfirmScreen={() => setShowConfirmation(true)}
          />
        </styledEl.TradeButtonBox>
      </>
    ),
  }

  const params = {
    disableNonToken: false,
    compactView: false,
    recipient,
    showRecipient,
    isTradePriceUpdating,
    priceImpact,
    isRateLoading,
  }

  return (
    <>
      <TradeWidget
        slots={slots}
        actions={widgetActions}
        params={params}
        inputCurrencyInfo={inputCurrencyInfo}
        outputCurrencyInfo={outputCurrencyInfo}
      />
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
      {isUnlocked && <InfoBanner />}
    </>
  )
}, limitOrdersPropsChecker)
