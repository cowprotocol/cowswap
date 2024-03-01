import { useMemo } from 'react'

import type { CowSwapWidgetEnv, CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { isDev, isLocalHost, isVercel } from '../../../env'
import { ConfiguratorState } from '../types'

const getEnv = (): CowSwapWidgetEnv => {
  if (isLocalHost) return 'local'
  if (isDev) return 'dev'
  if (isVercel) return 'pr'

  return 'prod'
}

export function useWidgetParams(configuratorState: ConfiguratorState, isDappMode: boolean): CowSwapWidgetParams {
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
      tokenLists,
      customColors,
      defaultColors,
      partnerFeePercent,
      partnerFeeRecipient,
    } = configuratorState

    const themeColors = {
      ...defaultColors,
      ...customColors,
    }

    const params: CowSwapWidgetParams = {
      appCode: 'CoW Widget: Configurator',
      width: '450px',
      height: '640px',
      chainId,
      tokenLists: tokenLists.filter((list) => list.enabled).map((list) => list.url),
      env: getEnv(),
      tradeType: currentTradeType,
      sell: { asset: sellToken, amount: sellTokenAmount ? sellTokenAmount.toString() : undefined },
      buy: { asset: buyToken, amount: buyTokenAmount?.toString() },
      enabledTradeTypes,
      theme: {
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

      hideConnectButton: isDappMode,

      partnerFee: {
        bps: Math.ceil(partnerFeePercent * 100),
        recipient: partnerFeeRecipient,
      },
    }

    return params
  }, [configuratorState, isDappMode])
}
