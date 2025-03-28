import { AcrossBridgeProvider, BridgingSdk } from '@cowprotocol/cow-sdk'

import { tradingSdk } from './tradingSdk'

export const acrossBridgeProvider = new AcrossBridgeProvider({
  // getTokenInfos(chainId: number, addresses: string[]): Promise<TokenInfo[]> {},
})

export const bridgingSdk = new BridgingSdk({
  providers: [acrossBridgeProvider],
  enableLogging: true,
  tradingSdk,
  // TODO: getErc20Decimals
})
