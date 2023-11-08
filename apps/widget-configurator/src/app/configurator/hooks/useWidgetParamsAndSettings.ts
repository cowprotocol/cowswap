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
      // theme,
      theme: {
        baseTheme: theme,
        primaryColor: '#fff700', //'#d9258e',
        screenBackground: '#ee9b00', // '#ee00cd',
        widgetBackground: '#ff0037', // '#b900ff',
        textColor: '#7a75ff', //'#b348cc',
      },
    }

    return params
  }, [provider, configuratorState])
}
