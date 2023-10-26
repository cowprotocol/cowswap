import { useMemo } from 'react'

import { CowSwapWidgetParams, CowSwapWidgetSettings, EthereumProvider } from '@cowprotocol/widget-lib'

import { ConfiguratorState } from '../types'

export function useWidgetParamsAndSettings(
  provider: EthereumProvider | null,
  widgetContainer: HTMLDivElement,
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
      isDynamicHeightEnabled,
    } = configuratorState

    const params: CowSwapWidgetParams = {
      container: widgetContainer,
      metaData: { appKey: '<YOUR_APP_ID>', url: '<https://YOUR_APP_URL>' },
      width: 400,
      height: 640,
      provider,
    }

    const settings: CowSwapWidgetSettings = {
      urlParams: {
        theme,
        chainId,
        env: 'local',
        tradeType: currentTradeType,
        tradeAssets: {
          sell: { asset: sellToken, amount: sellTokenAmount ? sellTokenAmount.toString() : undefined },
          buy: { asset: buyToken, amount: buyTokenAmount.toString() },
        },
      },
      appParams: {
        dynamicHeightEnabled: isDynamicHeightEnabled,
        enabledTradeTypes,
      },
    }

    return { params, settings }
  }, [provider, widgetContainer, configuratorState])
}
