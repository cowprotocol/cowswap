import { ProviderMode } from './ProviderMode'
import { Settings } from './Settings'

import { cowSwapWidget, CowSwapWidgetAppParams, CowSwapWidgetUrlParams, EthereumProvider } from '../index'

const urlParams: CowSwapWidgetUrlParams = {
  env: 'local',
  chainId: 1,
  theme: 'light',
  tradeType: 'swap',
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

const appParams: CowSwapWidgetAppParams = {}

function init(provider?: EthereumProvider) {
  const updateWidget = cowSwapWidget(
    {
      width: 400,
      height: 640,
      container: document.getElementById('widgetContainer') as HTMLElement,
      provider,
    },
    { urlParams, appParams }
  )

  Settings(updateWidget)
}

ProviderMode(init)
