import { useEffect, useState, useTransition } from 'react'

import { CowSwapWidgetParams, TradeType, WidgetHookEvents } from '@cowprotocol/widget-lib'

import { CONFIGURATOR_WIDGET_PREVIEW_APP_CODE_FALLBACK } from '../configurator.constants'
import { ConfiguratorState } from '../configurator.types'
import { CONFIGURATOR_DEFAULT_WIDGET_BASE_URL } from '../utils/baseUrl'

const getTokenListsParam = (
  tokenListUrls: ConfiguratorState['tokenListUrls'],
  key: 'enabled' | 'enabledForSell' | 'enabledForBuy',
): string[] => {
  return tokenListUrls.filter((list) => list[key]).map((list) => list.url)
}

const getForcedOrderDeadline = ({
  deadline,
  swapDeadline,
  limitDeadline,
  advancedDeadline,
}: Pick<
  ConfiguratorState,
  'deadline' | 'swapDeadline' | 'limitDeadline' | 'advancedDeadline'
>): CowSwapWidgetParams['forcedOrderDeadline'] => {
  if (!swapDeadline && !limitDeadline && !advancedDeadline) {
    return deadline
  }

  return {
    [TradeType.SWAP]: swapDeadline,
    [TradeType.LIMIT]: limitDeadline,
    [TradeType.ADVANCED]: advancedDeadline,
  }
}

function confirmWidgetHookAction(message: string): boolean {
  return prompt(message) === 'ok'
}

function getWidgetHooks(enabledWidgetHooks: WidgetHookEvents[]): CowSwapWidgetParams['hooks'] {
  const hooks: CowSwapWidgetParams['hooks'] = {
    ...(enabledWidgetHooks.includes(WidgetHookEvents.ON_BEFORE_APPROVAL)
      ? {
          onBeforeApproval(payload) {
            console.log('[COW][HOOKS] onBeforeApproval', payload)
            return confirmWidgetHookAction(`Type "ok" to proceed with approval on chainId ${payload.chainId}`)
          },
        }
      : null),
    ...(enabledWidgetHooks.includes(WidgetHookEvents.ON_BEFORE_TRADE)
      ? {
          onBeforeTrade(payload) {
            const sellToken = payload.sellToken?.symbol || 'unknown'
            const buyToken = payload.buyToken?.symbol || 'unknown'

            console.log('[COW][HOOKS] onBeforeTrade', payload)
            return confirmWidgetHookAction(
              `Type "ok" to proceed with ${payload.orderType} trade ${sellToken} -> ${buyToken}`,
            )
          },
        }
      : null),
    ...(enabledWidgetHooks.includes(WidgetHookEvents.ON_BEFORE_WRAP_UNWRAP)
      ? {
          onBeforeWrapOrUnwrap(payload) {
            const sellToken = payload.sellToken?.symbol || 'unknown'
            const buyToken = payload.buyToken?.symbol || 'unknown'

            console.log('[COW][HOOKS] onBeforeWrapOrUnwrap', payload)
            return confirmWidgetHookAction(`Type "ok" to proceed with wrap/unwrap ${sellToken} -> ${buyToken}`)
          },
        }
      : null),
    ...(enabledWidgetHooks.includes(WidgetHookEvents.ON_BEFORE_ORDER_CANCEL)
      ? {
          onBeforeOrderCancel(payload) {
            console.log('[COW][HOOKS] onBeforeOrderCancel', payload)
            return confirmWidgetHookAction(`Type "ok" to cancel order ${payload.uid}`)
          },
        }
      : null),
    ...(enabledWidgetHooks.includes(WidgetHookEvents.ON_BEFORE_ORDERS_CANCEL)
      ? {
          onBeforeOrdersCancel(payload) {
            console.log('[COW][HOOKS] onBeforeOrdersCancel', payload)
            return confirmWidgetHookAction(`Type "ok" to cancel ${payload.length} orders`)
          },
        }
      : null),
  }

  return hooks
}

function getThemeParam(
  theme: ConfiguratorState['theme'],
  customColors: ConfiguratorState['customColors'],
  defaultColors: ConfiguratorState['defaultColors'],
): CowSwapWidgetParams['theme'] {
  if (JSON.stringify(customColors) === JSON.stringify(defaultColors)) {
    return theme
  }

  const themeColors = {
    ...defaultColors,
    ...customColors,
  }

  return {
    baseTheme: theme,
    primary: themeColors.primary,
    background: themeColors.background,
    paper: themeColors.paper,
    text: themeColors.text,
    danger: themeColors.danger,
    warning: themeColors.warning,
    alert: themeColors.alert,
    info: themeColors.info,
    success: themeColors.success,
  }
}

function getPartnerFeeParam(
  partnerFeeBps: ConfiguratorState['partnerFeeBps'],
  partnerFeeRecipient: ConfiguratorState['partnerFeeRecipient'],
): CowSwapWidgetParams['partnerFee'] {
  if (partnerFeeBps <= 0) {
    return undefined
  }

  return {
    bps: partnerFeeBps,
    recipient: partnerFeeRecipient,
  }
}

// eslint-disable-next-line max-lines-per-function
function buildWidgetParams(configuratorState: ConfiguratorState | null): CowSwapWidgetParams | null {
  if (!configuratorState) return null

  const {
    // Basics:

    appCode,
    widgetMode,
    locale,

    // Trade Setup:

    enabledTradeTypes,
    currentTradeType,
    chainId,
    disableCrossChainSwap,
    slippage, // TODO: Defined but not in form.

    // Tokens:

    sellToken,
    sellTokenAmount,
    buyToken,
    buyTokenAmount,
    tokenListUrls,
    customTokens,

    // Theme Colors:

    theme,
    customColors,
    defaultColors,

    // Layout:

    autoResizeEnabled,
    iframeStyle,
    appWrapperStyle,
    bodyWrapperStyle,
    cardStyle,

    // Behavior:

    disableToastMessages,
    disableProgressBar,
    disablePostTradeTips,
    disableTokenImport,
    hideRecentTokens,
    hideFavoriteTokens,
    hideBridgeInfo,
    hideOrdersTable,
    disableTradeWhenPriceImpactIsUnknown,
    disableTradeWhenPriceImpactIsHigherThan,

    // Deadlines:

    deadline,
    swapDeadline,
    limitDeadline,
    advancedDeadline,

    // Integrations:

    partnerFeeBps,
    partnerFeeRecipient,

    // Customization:

    customImages,
    customSounds,

    // Advanced:

    baseUrl: rawBaseUrl,
    enabledWidgetHooks,
    rawParams,
  } = configuratorState

  const baseUrl = rawBaseUrl || CONFIGURATOR_DEFAULT_WIDGET_BASE_URL

  // TODO: Can we automatically trim all values and avoid adding those that are not needed? Would that be better or worse (as then those props that are not provided)
  // rely on the widget app logic to use the default values, which potentially means more bugs / breaking changes?

  return {
    // Basics:

    appCode: appCode.trim() || CONFIGURATOR_WIDGET_PREVIEW_APP_CODE_FALLBACK,
    standaloneMode: widgetMode === 'standalone',
    locale,

    // Trade Setup:

    enabledTradeTypes,
    tradeType: currentTradeType,
    chainId,
    disableCrossChainSwap,
    slippage, // TODO: Defined but not in the form.

    // Tokens:

    sell: { asset: sellToken, amount: sellTokenAmount ? sellTokenAmount.toString() : undefined },
    buy: { asset: buyToken, amount: buyTokenAmount?.toString() },
    sellTokenLists: getTokenListsParam(tokenListUrls, 'enabledForSell'),
    buyTokenLists: getTokenListsParam(tokenListUrls, 'enabledForBuy'),
    tokenLists: getTokenListsParam(tokenListUrls, 'enabled'),
    customTokens,

    // Theme Colors:

    theme: getThemeParam(theme, customColors, defaultColors),

    // Layout:

    autoResizeEnabled,
    iframeStyle,
    appWrapperStyle,
    bodyWrapperStyle,
    cardStyle,

    // Behavior:

    disableToastMessages,
    disableProgressBar,
    disablePostTradeTips,
    disableTokenImport,
    hideRecentTokens,
    hideFavoriteTokens,
    hideBridgeInfo,
    hideOrdersTable,
    disableTrade: {
      whenPriceImpactIsUnknown: disableTradeWhenPriceImpactIsUnknown,
      whenPriceImpactIsHigherThan: disableTradeWhenPriceImpactIsHigherThan,
    },

    // Deadlines:

    forcedOrderDeadline: getForcedOrderDeadline({ deadline, swapDeadline, limitDeadline, advancedDeadline }),

    // Integrations:

    partnerFee: getPartnerFeeParam(partnerFeeBps, partnerFeeRecipient),

    // Customization:

    images: customImages,
    sounds: customSounds,

    // Advanced:

    baseUrl,
    hooks: getWidgetHooks(enabledWidgetHooks),
    ...rawParams,
    ...window.cowSwapWidgetParams,
  }
}

export function useWidgetParams(configuratorState: ConfiguratorState | null): [CowSwapWidgetParams | null, boolean] {
  const [isPending, startTransition] = useTransition()
  const [debouncedConfiguratorState, setDebouncedConfiguratorState] = useState<CowSwapWidgetParams | null>(() =>
    buildWidgetParams(configuratorState),
  )

  useEffect(() => {
    startTransition(() => {
      setDebouncedConfiguratorState(buildWidgetParams(configuratorState))
    })
  }, [configuratorState])

  return [debouncedConfiguratorState, isPending]
}
