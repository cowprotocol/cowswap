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
    } = configuratorState

    const params: CowSwapWidgetProps['params'] = {
      appKey: '<YOUR_APP_ID>',
      width: '400px',
      height: '640px',
      provider,
      theme,
      chainId,
      env: getEnv(),
      tradeType: currentTradeType,
      tradeAssets: {
        sell: { asset: sellToken, amount: sellTokenAmount ? sellTokenAmount.toString() : undefined },
        buy: { asset: buyToken, amount: buyTokenAmount?.toString() },
      },
      enabledTradeTypes,
      // palette: {
      //   primaryColor: '#d9258e',
      //   screenBackground: '#ee00cd',
      //   widgetBackground: '#b900ff',
      //   textColor: '#b348cc',
      // },
    }

    return params
  }, [provider, configuratorState])
}
