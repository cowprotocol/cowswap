import { useMemo } from 'react'

import type { CowSwapWidgetEnv, EthereumProvider } from '@cowprotocol/widget-lib'
import { CowSwapWidgetProps } from '@cowprotocol/widget-react'

import { isDev, isLocalHost, isVercel } from '../../../env'
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
      defaultColors,
    } = configuratorState

    const themeColors = {
      ...defaultColors,
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
        background: themeColors.background,
        paper: themeColors.paper,
        text: themeColors.text,
        danger: themeColors.danger,
        warning: themeColors.warning,
        alert: themeColors.alert,
        info: themeColors.info,
        success: themeColors.success,
      },
    }

    return params
  }, [provider, configuratorState])
}
