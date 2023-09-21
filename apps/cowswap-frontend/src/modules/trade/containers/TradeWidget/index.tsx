import { ReactNode, useEffect } from 'react'

import { maxAmountSpend } from '@cowprotocol/common-utils'
import { useIsSafeWallet, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/macro'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { TradeWidgetLinks } from 'modules/application/containers/TradeWidgetLinks'
import { SetRecipientProps } from 'modules/swap/containers/SetRecipient'
import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'
import { RecipientAddressUpdater } from 'modules/trade/updaters/RecipientAddressUpdater'
import { TradeFormValidationUpdater } from 'modules/tradeFormValidation'
import { TradeQuoteUpdater } from 'modules/tradeQuote'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { useThrottleFn } from 'common/hooks/useThrottleFn'
import { CurrencyArrowSeparator } from 'common/pure/CurrencyArrowSeparator'
import { CurrencyInputPanel, CurrencyInputPanelProps } from 'common/pure/CurrencyInputPanel'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

import * as styledEl from './styled'
import { TradeWidgetModals } from './TradeWidgetModals'

import { CommonTradeUpdater } from '../../updaters/CommonTradeUpdater'
import { DisableNativeTokenSellingUpdater } from '../../updaters/DisableNativeTokenSellingUpdater'
import { PriceImpactUpdater } from '../../updaters/PriceImpactUpdater'
import { WrapFlowActionButton } from '../WrapFlowActionButton'
import { WrapNativeModal } from '../WrapNativeModal'

export interface TradeWidgetActions {
  onCurrencySelection: CurrencyInputPanelProps['onCurrencySelection']
  onUserInput: CurrencyInputPanelProps['onUserInput']
  onChangeRecipient: SetRecipientProps['onChangeRecipient']
  onSwitchTokens(): void
}

interface TradeWidgetParams {
  recipient: string | null
  disableNonToken?: boolean
  isEoaEthFlow?: boolean
  compactView: boolean
  showRecipient: boolean
  isTradePriceUpdating: boolean
  isExpertMode: boolean
  priceImpact: PriceImpact
  disableQuotePolling?: boolean
  disableNativeSelling?: boolean
  disablePriceImpact: boolean
}

export interface TradeWidgetSlots {
  settingsWidget: ReactNode
  lockScreen?: ReactNode
  middleContent?: ReactNode
  bottomContent?: ReactNode
  updaters?: ReactNode
}

export interface TradeWidgetProps {
  id?: string
  slots: TradeWidgetSlots
  inputCurrencyInfo: CurrencyInfo
  outputCurrencyInfo: CurrencyInfo
  actions: TradeWidgetActions
  params: TradeWidgetParams
  disableOutput?: boolean
}

export const TradeWidgetContainer = styledEl.Container

export function TradeWidget(props: TradeWidgetProps) {
  const { id, slots, inputCurrencyInfo, outputCurrencyInfo, actions, params, disableOutput } = props
  const { settingsWidget, lockScreen, middleContent, bottomContent, updaters } = slots

  const { onCurrencySelection, onUserInput, onSwitchTokens, onChangeRecipient } = actions
  const {
    compactView,
    showRecipient,
    isTradePriceUpdating,
    isEoaEthFlow = false,
    disableNonToken = false,
    priceImpact,
    recipient,
    disableQuotePolling = false,
    isExpertMode,
    disableNativeSelling = false,
    disablePriceImpact,
  } = params

  const { chainId } = useWalletInfo()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const { allowsOffchainSigning } = useWalletDetails()
  const isChainIdUnsupported = useIsProviderNetworkUnsupported()
  const isSafeWallet = useIsSafeWallet()

  const currenciesLoadingInProgress = !inputCurrencyInfo.currency && !outputCurrencyInfo.currency

  const canSellAllNative = isSafeWallet
  const maxBalance = maxAmountSpend(inputCurrencyInfo.balance || undefined, canSellAllNative)
  const showSetMax = maxBalance?.greaterThan(0) && !inputCurrencyInfo.amount?.equalTo(maxBalance)

  // Disable too frequent tokens switching
  const throttledOnSwitchTokens = useThrottleFn(onSwitchTokens, 500)

  const currencyInputCommonProps = {
    isChainIdUnsupported,
    disableNonToken,
    chainId,
    areCurrenciesLoading: currenciesLoadingInProgress,
    onCurrencySelection,
    onUserInput,
    allowsOffchainSigning,
  }

  /**
   * Reset recipient value only once at App start
   */
  useEffect(() => {
    onChangeRecipient(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <styledEl.Container id={id}>
      <RecipientAddressUpdater />

      {!disableQuotePolling && <TradeQuoteUpdater />}
      <TradeWidgetModals />
      <WrapNativeModal />
      <PriceImpactUpdater />
      <TradeFormValidationUpdater isExpertMode={isExpertMode} />
      <CommonTradeUpdater />
      {disableNativeSelling && <DisableNativeTokenSellingUpdater />}
      {updaters}

      <styledEl.Container id={id}>
        <styledEl.ContainerBox>
          <styledEl.Header>
            <TradeWidgetLinks />
            {!lockScreen && settingsWidget}
          </styledEl.Header>

          {lockScreen ? (
            lockScreen
          ) : (
            <>
              <div>
                <CurrencyInputPanel
                  id="input-currency-input"
                  currencyInfo={inputCurrencyInfo}
                  showSetMax={showSetMax}
                  maxBalance={maxBalance}
                  topLabel={isWrapOrUnwrap ? undefined : inputCurrencyInfo.label}
                  {...currencyInputCommonProps}
                />
              </div>
              {!isWrapOrUnwrap && middleContent}
              <styledEl.CurrencySeparatorBox compactView={compactView} withRecipient={!isWrapOrUnwrap && showRecipient}>
                <CurrencyArrowSeparator
                  isCollapsed={compactView}
                  hasSeparatorLine={!compactView}
                  border={!compactView}
                  onSwitchTokens={isChainIdUnsupported ? () => void 0 : throttledOnSwitchTokens}
                  withRecipient={!isWrapOrUnwrap && showRecipient}
                  isLoading={isTradePriceUpdating}
                />
              </styledEl.CurrencySeparatorBox>
              <div>
                <CurrencyInputPanel
                  id="output-currency-input"
                  inputDisabled={isEoaEthFlow || isWrapOrUnwrap || disableOutput}
                  inputTooltip={
                    isEoaEthFlow
                      ? t`You cannot edit this field when selling ${inputCurrencyInfo?.currency?.symbol}`
                      : undefined
                  }
                  currencyInfo={
                    isWrapOrUnwrap ? { ...outputCurrencyInfo, amount: inputCurrencyInfo.amount } : outputCurrencyInfo
                  }
                  priceImpactParams={!disablePriceImpact ? priceImpact : undefined}
                  topLabel={isWrapOrUnwrap ? undefined : outputCurrencyInfo.label}
                  {...currencyInputCommonProps}
                />
              </div>
              {!isWrapOrUnwrap && showRecipient && (
                <styledEl.StyledRemoveRecipient recipient={recipient || ''} onChangeRecipient={onChangeRecipient} />
              )}

              {isWrapOrUnwrap ? <WrapFlowActionButton /> : bottomContent}
            </>
          )}
        </styledEl.ContainerBox>
      </styledEl.Container>
    </styledEl.Container>
  )
}
