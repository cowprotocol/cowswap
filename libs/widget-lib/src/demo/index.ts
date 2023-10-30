import { ProviderMode } from './ProviderMode'
import { Settings } from './Settings'

import { cowSwapWidget, CowSwapWidgetSettings, EthereumProvider, TradeType } from '../index'

const urlParams: CowSwapWidgetSettings = {
  env: 'local',
  chainId: 1,
  theme: 'light',
  tradeType: TradeType.SWAP,
  tradeAssets: {
    sell: {
      // asset: '0x543ff227f64aa17ea132bf9886cab5db55dcaddf',
      asset: 'COW',
      amount: '1200',
    },
    buy: {
      asset: 'WETH',
    },
  },
}

function init(provider?: EthereumProvider) {
  const updateWidget = cowSwapWidget(
    {
      width: 400,
      height: 640,
      container: document.getElementById('widgetContainer') as HTMLElement,
      provider,
      metaData: {
        appKey: 'CowSwapWidgetDemoApp',
        url: 'https://swap.cow.fi/assets/injected-widget/',
      },
    },
    urlParams
  )

  Settings(updateWidget)
}

ProviderMode(init)
