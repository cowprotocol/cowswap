import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { AddIntermediateToken } from 'modules/tokensList'
import {
  useIsCurrentTradeBridging,
  useIsNoImpactWarningAccepted,
  useTradeConfirmActions,
  useWrappedToken,
} from 'modules/trade'
import {
  TradeFormButtons,
  TradeFormValidation,
  useGetTradeFormValidation,
  useTradeFormButtonContext,
} from 'modules/tradeFormValidation'
import { useHighFeeWarning } from 'modules/tradeWidgetAddons'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import { useSafeMemoObject } from 'common/hooks/useSafeMemo'

import { swapTradeButtonsMap } from './swapTradeButtonsMap'

import { useOnCurrencySelection } from '../../hooks/useOnCurrencySelection'
import { useSwapDerivedState } from '../../hooks/useSwapDerivedState'
import { useSwapFormState } from '../../hooks/useSwapFormState'

const BRIDGE_ANALYTICS_EVENT = {
  category: CowSwapAnalyticsCategory.Bridge,
  action: 'swap_bridge_click',
}

interface TradeButtonsProps {
  isTradeContextReady: boolean

  openNativeWrapModal(): void

  hasEnoughWrappedBalanceForSwap: boolean
  tokenToBeImported: boolean
  intermediateBuyToken: TokenWithLogo | null
  setShowAddIntermediateTokenModal: (show: boolean) => void
}

// eslint-disable-next-line complexity, max-lines-per-function
export function TradeButtons({
  isTradeContextReady,
  openNativeWrapModal,
  hasEnoughWrappedBalanceForSwap,
  tokenToBeImported,
  intermediateBuyToken,
  setShowAddIntermediateTokenModal,
}: TradeButtonsProps): ReactNode {
  const { chainId, account: walletAddress } = useWalletInfo()
  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount } = useSwapDerivedState()

  const primaryFormValidation = useGetTradeFormValidation()
  const tradeConfirmActions = useTradeConfirmActions()
  const { feeWarningAccepted } = useHighFeeWarning()
  const isNoImpactWarningAccepted = useIsNoImpactWarningAccepted()
  const localFormValidation = useSwapFormState()
  const wrappedToken = useWrappedToken()
  const onCurrencySelection = useOnCurrencySelection()
  const isCurrentTradeBridging = useIsCurrentTradeBridging()

  const confirmTrade = tradeConfirmActions.onOpen

  const confirmText = isCurrentTradeBridging ? 'Swap and Bridge' : 'Swap'

  const { isPartialApproveEnabled } = useFeatureFlags()
  const tradeFormButtonContext = useTradeFormButtonContext(confirmText, confirmTrade, !!isPartialApproveEnabled)

  const sellTokenChainId = inputCurrency?.chainId ?? chainId
  const destinationChainFallback = !isCurrentTradeBridging ? chainId : undefined
  const buyTokenChainId = outputCurrency?.chainId ?? destinationChainFallback
  const toChainId = outputCurrency?.chainId ?? destinationChainFallback

  // Analytics event for bridge transactions
  const swapBridgeClickEvent =
    isCurrentTradeBridging && inputCurrency && outputCurrency && inputCurrencyAmount
      ? toCowSwapGtmEvent({
          ...BRIDGE_ANALYTICS_EVENT,
          label: `From: ${chainId}, To: ${toChainId ?? 'unknown'}, TokenIn: ${inputCurrency.symbol || ''}, TokenOut: ${outputCurrency.symbol || ''}, Amount: ${inputCurrencyAmount.toSignificant(6)}`,
          from_chain_id: chainId,
          ...(toChainId !== undefined && { to_chain_id: toChainId }),
          wallet_address: walletAddress,
          sell_token: getCurrencyAddress(inputCurrency),
          sell_token_symbol: inputCurrency.symbol || '',
          sell_token_chain_id: sellTokenChainId,
          sell_amount: inputCurrencyAmount.quotient.toString(),
          sell_amount_human: inputCurrencyAmount.toSignificant(6),
          ...(outputCurrencyAmount && {
            buy_token: getCurrencyAddress(outputCurrency),
            buy_token_symbol: outputCurrency.symbol || '',
            ...(buyTokenChainId !== undefined && { buy_token_chain_id: buyTokenChainId }),
            buy_amount_expected: outputCurrencyAmount.quotient.toString(),
            buy_amount_human: outputCurrencyAmount.toSignificant(6),
          }),
          value: Number(inputCurrencyAmount.toSignificant(6)),
        })
      : undefined

  const context = useSafeMemoObject({
    wrappedToken,
    onEthFlow: openNativeWrapModal,
    openSwapConfirm: confirmTrade,
    inputCurrency,
    hasEnoughWrappedBalanceForSwap,
    onCurrencySelection,
    confirmText,
  })

  const shouldShowAddIntermediateToken =
    tokenToBeImported &&
    !!intermediateBuyToken &&
    primaryFormValidation === TradeFormValidation.ImportingIntermediateToken

  // Selling ETH is allowed in Swap
  const isPrimaryValidationPassed =
    !primaryFormValidation || primaryFormValidation === TradeFormValidation.SellNativeToken
  const isDisabled = !isTradeContextReady || !feeWarningAccepted || !isNoImpactWarningAccepted

  if (!tradeFormButtonContext) return null

  if (localFormValidation && isPrimaryValidationPassed) {
    return swapTradeButtonsMap[localFormValidation](context, isDisabled)
  }

  return (
    <>
      <TradeFormButtons
        confirmText={confirmText}
        validation={primaryFormValidation}
        context={tradeFormButtonContext}
        isDisabled={isDisabled}
        data-click-event={swapBridgeClickEvent}
      />
      {shouldShowAddIntermediateToken && (
        <AddIntermediateToken
          intermediateBuyToken={intermediateBuyToken!}
          onImport={() => setShowAddIntermediateTokenModal(true)}
        />
      )}
    </>
  )
}
