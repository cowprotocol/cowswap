import { useMemo } from 'react'

import type { CowSwapWidgetEnv, EthereumProvider } from '@cowprotocol/widget-lib'
import { CowSwapWidgetProps } from '@cowprotocol/widget-react'

import { isDev, isLocalHost, isVercel } from '../../../env'
import { DEFAULT_LIGHT_PALETTE, DEFAULT_DARK_PALETTE } from '../consts'
import { ConfiguratorState } from '../types'

const getEnv = (): CowSwapWidgetEnv => {
  if (isLocalHost) return 'local'
  if (isDev) return 'dev'
  if (isVercel) return 'pr'

  return 'prod'
}

export function useWidgetParamsAndSettings(
  provider: EthereumProvider | undefined,
  configuratorState: ConfiguratorState
) {
  console.log('useWidgetParamsAndSettings', configuratorState)

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
      customColors,
    } = configuratorState

    const themeColors = {
      ...(theme === 'dark' ? DEFAULT_DARK_PALETTE : DEFAULT_LIGHT_PALETTE),
      ...customColors,
    }

    const params: CowSwapWidgetProps['params'] = {
      appCode: 'CoW Widget: Configurator',
      width: '450px',
      height: '640px',
      provider,
      chainId,
      env: getEnv(),
      tradeType: currentTradeType,
      sell: { asset: sellToken, amount: sellTokenAmount ? sellTokenAmount.toString() : undefined },
      buy: { asset: buyToken, amount: buyTokenAmount?.toString() },
      enabledTradeTypes,
      theme: {
        baseTheme: theme,
        primary: themeColors.primary,
        secondary: themeColors.secondary,
        background: themeColors.background,
        paper: themeColors.paper,
        primaryText: themeColors.primaryText,
        danger: themeColors.danger,
        warning: themeColors.warning,
        info: themeColors.info,
        success: themeColors.success,
      },
    }

    return params
  }, [provider, configuratorState])
}
