import { useMemo } from 'react'

import { CowSwapWidgetParams, TradeType, WidgetHookEvents } from '@cowprotocol/widget-lib'

import { isDev, isLocalHost, isVercel } from '../../../env'
import { ConfiguratorState } from '../types'

const vercelSuffix = '-cowswap-dev.vercel.app'

const getBaseUrl = (): string => {
  if (typeof window === 'undefined' || !window) return ''

  if (isLocalHost) return 'http://localhost:3000'

  if (isDev) return 'https://dev.swap.cow.fi'

  if (isVercel) {
    const prKey = window.location.hostname.replace('widget-configurator-git-', '').replace(vercelSuffix, '')

    return `https://swap-dev-git-${prKey}${vercelSuffix}`
  }

  return 'https://swap.cow.fi'
}

const DEFAULT_BASE_URL = getBaseUrl()

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
            return confirmWidgetHookAction(`Type "ok" to proceed with approval on chainId ${payload.chainId}`)
          },
        }
      : null),
    ...(enabledWidgetHooks.includes(WidgetHookEvents.ON_BEFORE_TRADE)
      ? {
          onBeforeTrade(payload) {
            const sellToken = payload.sellToken?.symbol || 'unknown'
            const buyToken = payload.buyToken?.symbol || 'unknown'

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

            return confirmWidgetHookAction(`Type "ok" to proceed with wrap/unwrap ${sellToken} -> ${buyToken}`)
          },
        }
      : null),
    ...(enabledWidgetHooks.includes(WidgetHookEvents.ON_BEFORE_ORDER_CANCEL)
      ? {
          onBeforeOrderCancel(payload) {
            return confirmWidgetHookAction(`Type "ok" to cancel order ${payload.uid}`)
          },
        }
      : null),
    ...(enabledWidgetHooks.includes(WidgetHookEvents.ON_BEFORE_ORDERS_CANCEL)
      ? {
          onBeforeOrdersCancel(payload) {
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
  boxShadow: ConfiguratorState['boxShadow'],
): CowSwapWidgetParams['theme'] {
  if (JSON.stringify(customColors) === JSON.stringify(defaultColors) && !boxShadow) {
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
    ...(boxShadow ? { boxShadow } : null),
  }
}

export function useWidgetParams(configuratorState: ConfiguratorState): CowSwapWidgetParams {
  return useMemo(() => {
    const {
      chainId,
      locale,
      theme,
      boxShadow,
      currentTradeType,
      enabledTradeTypes,
      sellToken,
      sellTokenAmount,
      buyToken,
      buyTokenAmount,
      deadline,
      swapDeadline,
      limitDeadline,
      advancedDeadline,
      tokenListUrls,
      customColors,
      defaultColors,
      partnerFeeBps,
      partnerFeeRecipient,
      standaloneMode,
      disableToastMessages,
      disableProgressBar,
      disablePostTradeTips,
      disableCrossChainSwap,
      disableTokenImport,
      hideRecentTokens,
      hideFavoriteTokens,
      hideBridgeInfo,
      hideOrdersTable,
      disableTradeWhenPriceImpactIsUnknown,
      disableTradeWhenPriceImpactIsHigherThan,
      slippage,
      enabledWidgetHooks,
    } = configuratorState

    const params: CowSwapWidgetParams = {
      appCode: 'CoW Widget: Configurator',
      width: '100%',
      height: '640px',
      chainId,
      locale,
      tokenLists: getTokenListsParam(tokenListUrls, 'enabled'),
      sellTokenLists: getTokenListsParam(tokenListUrls, 'enabledForSell'),
      buyTokenLists: getTokenListsParam(tokenListUrls, 'enabledForBuy'),
      baseUrl: DEFAULT_BASE_URL,
      tradeType: currentTradeType,
      sell: { asset: sellToken, amount: sellTokenAmount ? sellTokenAmount.toString() : undefined },
      buy: { asset: buyToken, amount: buyTokenAmount?.toString() },
      forcedOrderDeadline: getForcedOrderDeadline({ deadline, swapDeadline, limitDeadline, advancedDeadline }),
      enabledTradeTypes,
      theme: getThemeParam(theme, customColors, defaultColors, boxShadow),
      standaloneMode,
      disableToastMessages,
      disableProgressBar,
      disablePostTradeTips,
      disableCrossChainSwap,
      disableTokenImport,
      hideRecentTokens,
      hideFavoriteTokens,

      partnerFee:
        partnerFeeBps > 0
          ? {
              bps: partnerFeeBps,
              recipient: partnerFeeRecipient,
            }
          : undefined,
      hideBridgeInfo,
      hideOrdersTable,
      slippage,
      disableTrade: {
        whenPriceImpactIsUnknown: disableTradeWhenPriceImpactIsUnknown,
        whenPriceImpactIsHigherThan: disableTradeWhenPriceImpactIsHigherThan,
      },
      hooks: getWidgetHooks(enabledWidgetHooks),
    }

    return params
  }, [configuratorState])
}
