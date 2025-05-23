import { DEFAULT_APP_CODE, getRpcProvider } from '@cowprotocol/common-const'
import { getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { TradingSdk } from '@cowprotocol/cow-sdk'

import { orderBookApi } from '../cowSdk'

const chainId = getCurrentChainIdFromUrl()

export const tradingSdk = new TradingSdk(
  {
    chainId,
    appCode: DEFAULT_APP_CODE,
    signer: getRpcProvider(chainId)!.getSigner(),
    env: 'prod', // TODO: this is a temporary hack to force prod env
  },
  {
    orderBookApi,
  },
)
