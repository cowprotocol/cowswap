import { AcrossBridgeProvider, BridgingSdk, TargetChainId } from '@cowprotocol/cow-sdk'

import { getErc20Token } from './getErc20Token'
import { tradingSdk } from './tradingSdk'

export const acrossBridgeProvider = new AcrossBridgeProvider({
  // getTokenInfos(chainId: number, addresses: string[]): Promise<TokenInfo[]> {},
})

export const bridgingSdk = new BridgingSdk({
  providers: [acrossBridgeProvider],
  enableLogging: true,
  tradingSdk,
  async getErc20Decimals(chainId: TargetChainId, tokenAddress: string) {
    const token = await getErc20Token(chainId, tokenAddress)

    if (!token) {
      throw new Error('Cannot find a ERC-20 token: ' + tokenAddress + ' in chain ' + chainId)
    }

    return token?.decimals
  },
})
