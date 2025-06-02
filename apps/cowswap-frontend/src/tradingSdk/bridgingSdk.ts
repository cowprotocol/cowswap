import { AcrossBridgeProvider, BridgingSdk } from '@cowprotocol/cow-sdk'

import { orderBookApi } from 'cowSdk'

import { tradingSdk } from './tradingSdk'

export const acrossBridgeProvider = new AcrossBridgeProvider({})

export const bridgingSdk = new BridgingSdk({
  providers: [acrossBridgeProvider],
  enableLogging: false,
  tradingSdk,
  orderBookApi,
})
