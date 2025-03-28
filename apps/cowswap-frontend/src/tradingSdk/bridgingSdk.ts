import { AcrossBridgeProvider, BridgingSdk } from '@cowprotocol/cow-sdk'

import { tradingSdk } from './tradingSdk'

const acrossBridgeProvider = new AcrossBridgeProvider()

export const bridgingSdk = new BridgingSdk({
  providers: [acrossBridgeProvider],
  enableLogging: true,
  tradingSdk,
  // TODO: getErc20Decimals
})
