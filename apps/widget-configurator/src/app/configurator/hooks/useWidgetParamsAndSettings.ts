import { useMemo } from 'react'

import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { isDev, isLocalHost, isVercel } from '../../../env'
import { ConfiguratorState } from '../types'

const getBaseUrl = (): string => {
  if (typeof window === 'undefined' || !window) return ''

  if (isLocalHost) return 'http://localhost:3000'
  if (isDev) return 'https://dev.swap.cow.fi/'
  if (isVercel) {
    const prKey = window.location.hostname.replace('widget-configurator-git-', '').replace('-cowswap.vercel.app', '')
    return `https://swap-dev-git-${prKey}-cowswap.vercel.app`
  }

  return 'https://swap.cow.fi'
}

const DEFAULT_BASE_URL = getBaseUrl()

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
      tokenListUrls,
      customColors,
      defaultColors,
      partnerFeeBps,
      partnerFeeRecipient,
      standaloneMode,
      disableToastMessages,
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

      partnerFee:
        partnerFeeBps > 0
          ? {
              bps: partnerFeeBps,
              recipient: partnerFeeRecipient,
            }
          : undefined,
    }

    return params
  }, [configuratorState])
}
