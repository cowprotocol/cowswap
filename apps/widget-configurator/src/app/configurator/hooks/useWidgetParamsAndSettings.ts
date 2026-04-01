import { useMemo } from 'react'

import { CowSwapWidgetParams, TradeType } from '@cowprotocol/widget-lib'

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

const getThemeParam = ({
  theme,
  customColors,
  defaultColors,
}: Pick<ConfiguratorState, 'theme' | 'customColors' | 'defaultColors'>): CowSwapWidgetParams['theme'] => {
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

export function useWidgetParams(configuratorState: ConfiguratorState): CowSwapWidgetParams {
  return useMemo(() => {
    const {
      chainId,
      theme,
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
      hideRecentTokens,
      hideFavoriteTokens,
      hideBridgeInfo,
      hideOrdersTable,
      slippage,
    } = configuratorState

    const params: CowSwapWidgetParams = {
      appCode: 'CoW Widget: Configurator',
      width: '100%',
      height: '640px',
      chainId,
      tokenLists: getTokenListsParam(tokenListUrls, 'enabled'),
      sellTokenLists: getTokenListsParam(tokenListUrls, 'enabledForSell'),
      buyTokenLists: getTokenListsParam(tokenListUrls, 'enabledForBuy'),
      baseUrl: DEFAULT_BASE_URL,
      tradeType: currentTradeType,
      sell: { asset: sellToken, amount: sellTokenAmount ? sellTokenAmount.toString() : undefined },
      buy: { asset: buyToken, amount: buyTokenAmount?.toString() },
      forcedOrderDeadline: getForcedOrderDeadline({ deadline, swapDeadline, limitDeadline, advancedDeadline }),
      enabledTradeTypes,
      theme: getThemeParam({ theme, customColors, defaultColors }),

      standaloneMode,
      disableToastMessages,
      disableProgressBar,
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
    }

    return params
  }, [configuratorState])
}
