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
      hideBridgeInfo,
      hideOrdersTable,
      slippage,
      enabledWidgetHooks,
    } = configuratorState

    const params: CowSwapWidgetParams = {
      appCode: 'CoW Widget: Configurator',
      width: '100%',
      height: '640px',
      chainId,
      locale,
      tokenLists: tokenListUrls.filter((list) => list.enabled).map((list) => list.url),
      baseUrl: DEFAULT_BASE_URL,
      tradeType: currentTradeType,
      sell: { asset: sellToken, amount: sellTokenAmount ? sellTokenAmount.toString() : undefined },
      buy: { asset: buyToken, amount: buyTokenAmount?.toString() },
      forcedOrderDeadline:
        swapDeadline || limitDeadline || advancedDeadline
          ? {
              [TradeType.SWAP]: swapDeadline,
              [TradeType.LIMIT]: limitDeadline,
              [TradeType.ADVANCED]: advancedDeadline,
            }
          : deadline,
      enabledTradeTypes,
      theme: getThemeParam(theme, customColors, defaultColors, boxShadow),

      standaloneMode,
      disableToastMessages,
      disableProgressBar,

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
      hooks: {
        ...(enabledWidgetHooks.includes(WidgetHookEvents.ON_BEFORE_APPROVAL)
          ? {
              onBeforeApproval() {
                return prompt('Type "ok" to proceed') === 'ok'
              },
            }
          : null),
      },
    }

    return params
  }, [configuratorState])
}
