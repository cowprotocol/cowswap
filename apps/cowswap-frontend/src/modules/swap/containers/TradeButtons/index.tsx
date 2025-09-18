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
import type { CowSwapGtmEvent } from 'common/analytics/types'
import { useSafeMemoObject } from 'common/hooks/useSafeMemo'

import { swapTradeButtonsMap } from './swapTradeButtonsMap'

import { useOnCurrencySelection } from '../../hooks/useOnCurrencySelection'
import { useSwapDerivedState } from '../../hooks/useSwapDerivedState'
import { useSwapFormState } from '../../hooks/useSwapFormState'

const BRIDGE_ANALYTICS_EVENT = {
  category: CowSwapAnalyticsCategory.Bridge,
  action: 'swap_bridge_click',
}

function isBridgeEventBuildable(params: {
  isCurrentTradeBridging: boolean
  inputCurrency: ReturnType<typeof useSwapDerivedState>['inputCurrency']
  outputCurrency: ReturnType<typeof useSwapDerivedState>['outputCurrency']
  inputCurrencyAmount: ReturnType<typeof useSwapDerivedState>['inputCurrencyAmount']
}): boolean {
  const { isCurrentTradeBridging, inputCurrency, outputCurrency, inputCurrencyAmount } = params
  return Boolean(isCurrentTradeBridging && inputCurrency && outputCurrency && inputCurrencyAmount)
}

function getChainIds(params: {
  isCurrentTradeBridging: boolean
  inputCurrency: ReturnType<typeof useSwapDerivedState>['inputCurrency']
  outputCurrency: ReturnType<typeof useSwapDerivedState>['outputCurrency']
  chainId?: number
}): { sellTokenChainId?: number; buyTokenChainId?: number; toChainId?: number } {
  const { isCurrentTradeBridging, inputCurrency, outputCurrency, chainId } = params
  const sellTokenChainId = inputCurrency?.chainId ?? chainId
  const destinationChainFallback = !isCurrentTradeBridging ? chainId : undefined
  const buyTokenChainId = outputCurrency?.chainId ?? destinationChainFallback
  const toChainId = outputCurrency?.chainId ?? destinationChainFallback
  return { sellTokenChainId, buyTokenChainId, toChainId }
}

function buildBridgeLabel(
  fromChainId: number | undefined,
  toChainId: number | undefined,
  inputSymbol: string | undefined,
  outputSymbol: string | undefined,
  amountHuman: string,
): string {
  return `From: ${fromChainId}, To: ${toChainId ?? 'unknown'}, TokenIn: ${inputSymbol || ''}, TokenOut: ${outputSymbol || ''}, Amount: ${amountHuman}`
}

function buildBuyFields(params: {
  outputCurrency: ReturnType<typeof useSwapDerivedState>['outputCurrency']
  outputCurrencyAmount: ReturnType<typeof useSwapDerivedState>['outputCurrencyAmount']
  buyTokenChainId?: number
  toChainId?: number
}): Record<string, unknown> {
  const { outputCurrency, outputCurrencyAmount, buyTokenChainId, toChainId } = params
  const extra: Record<string, unknown> = {}
  if (toChainId !== undefined) extra.toChainId = toChainId
  if (outputCurrency && outputCurrencyAmount) {
    extra.buyToken = getCurrencyAddress(outputCurrency)
    extra.buyTokenSymbol = outputCurrency.symbol || ''
    if (buyTokenChainId !== undefined) extra.buyTokenChainId = buyTokenChainId
    extra.buyAmountExpected = outputCurrencyAmount.quotient.toString()
    extra.buyAmountHuman = outputCurrencyAmount.toSignificant(6)
  }
  return extra
}

function buildSwapBridgeClickEvent(params: {
  isCurrentTradeBridging: boolean
  inputCurrency: ReturnType<typeof useSwapDerivedState>['inputCurrency']
  outputCurrency: ReturnType<typeof useSwapDerivedState>['outputCurrency']
  inputCurrencyAmount: ReturnType<typeof useSwapDerivedState>['inputCurrencyAmount']
  outputCurrencyAmount: ReturnType<typeof useSwapDerivedState>['outputCurrencyAmount']
  chainId?: number
  walletAddress?: string
}): string | undefined {
  if (!isBridgeEventBuildable(params)) return undefined

  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount, chainId, walletAddress } = params
  if (!inputCurrency || !inputCurrencyAmount) return undefined
  const { sellTokenChainId, buyTokenChainId, toChainId } = getChainIds(params)

  const baseEvent: Record<string, unknown> = {
    ...BRIDGE_ANALYTICS_EVENT,
    label: buildBridgeLabel(
      chainId,
      toChainId,
      inputCurrency.symbol,
      outputCurrency?.symbol,
      inputCurrencyAmount.toSignificant(6),
    ),
    fromChainId: chainId,
    walletAddress,
    sellToken: getCurrencyAddress(inputCurrency),
    sellTokenSymbol: inputCurrency.symbol || '',
    sellTokenChainId: sellTokenChainId,
    sellAmount: inputCurrencyAmount.quotient.toString(),
    sellAmountHuman: inputCurrencyAmount.toSignificant(6),
    value: Number(inputCurrencyAmount.toSignificant(6)),
  }

  const extra = buildBuyFields({
    outputCurrency,
    outputCurrencyAmount,
    buyTokenChainId,
    toChainId,
  })

  return toCowSwapGtmEvent({
    ...baseEvent,
    ...extra,
  } as Omit<CowSwapGtmEvent, 'category'> & { category: CowSwapAnalyticsCategory })
}

interface TradeButtonsProps {
  isTradeContextReady: boolean

  openNativeWrapModal(): void

  hasEnoughWrappedBalanceForSwap: boolean
  tokenToBeImported: boolean
  intermediateBuyToken: TokenWithLogo | null
  setShowAddIntermediateTokenModal: (show: boolean) => void
}

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

  // Analytics event for bridge transactions
  const swapBridgeClickEvent = buildSwapBridgeClickEvent({
    isCurrentTradeBridging,
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount,
    outputCurrencyAmount,
    chainId,
    walletAddress,
  })

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
