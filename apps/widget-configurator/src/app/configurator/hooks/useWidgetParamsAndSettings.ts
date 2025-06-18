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

// TODO: Break down this large function into smaller functions
export function useWidgetParams(configuratorState: ConfiguratorState): CowSwapWidgetParams {
  // TODO: Break down this large function into smaller functions
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
      hideBridgeInfo,
      hideOrdersTable,
    } = configuratorState

    const themeColors = {
      ...defaultColors,
      ...customColors,
    }

    const params: CowSwapWidgetParams = {
      appCode: 'CoW Widget: Configurator',
      width: '100%',
      height: '640px',
      chainId,
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
      theme:
        JSON.stringify(customColors) === JSON.stringify(defaultColors)
          ? theme
          : {
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
            },

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
    }

    return params
  }, [configuratorState])
}
