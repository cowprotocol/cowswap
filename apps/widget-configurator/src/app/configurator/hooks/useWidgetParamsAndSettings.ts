import { useMemo } from 'react'

import { CowSwapWidgetEnv, CowSwapWidgetParams, CowSwapWidgetSettings, EthereumProvider } from '@cowprotocol/widget-lib'

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
  widgetContainer: HTMLDivElement | null,
  configuratorState: ConfiguratorState
) {
  return useMemo(() => {
    if (!widgetContainer) return null

    const {
      chainId,
      theme,
      currentTradeType,
      enabledTradeTypes,
      sellToken,
      sellTokenAmount,
      buyToken,
      buyTokenAmount,
      dynamicHeightEnabled,
    } = configuratorState

    const params: CowSwapWidgetParams = {
      container: widgetContainer,
      metaData: { appKey: '<YOUR_APP_ID>', url: '<https://YOUR_APP_URL>' },
      width: 400,
      height: 640,
      provider,
    }

    const settings: CowSwapWidgetSettings = {
      theme,
      chainId,
      env: getEnv(),
      tradeType: currentTradeType,
      tradeAssets: {
        sell: { asset: sellToken, amount: sellTokenAmount ? sellTokenAmount.toString() : undefined },
        buy: { asset: buyToken, amount: buyTokenAmount?.toString() },
      },
      dynamicHeightEnabled,
      enabledTradeTypes,
      // palette: {
      //   primaryColor: '#d9258e',
      //   screenBackground: '#c7860f',
      //   widgetBackground: '#eed4a7',
      //   textColor: '#413931',
      // },
    }

    return { params, settings }
  }, [provider, widgetContainer, configuratorState])
}
