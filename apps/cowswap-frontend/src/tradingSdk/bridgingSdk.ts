import { AcrossBridgeProvider, BridgingSdk, TargetChainId } from '@cowprotocol/cow-sdk'

import { orderBookApi } from 'cowSdk'

import { getErc20Tokens } from './getErc20Tokens'
import { tradingSdk } from './tradingSdk'

export const acrossBridgeProvider = new AcrossBridgeProvider({
  getTokenInfos: getErc20Tokens,
})

export const bridgingSdk = new BridgingSdk({
  providers: [acrossBridgeProvider],
  enableLogging: true,
  tradingSdk,
  orderBookApi,
  async getErc20Decimals(chainId: TargetChainId, tokenAddress: string) {
    const tokens = await getErc20Tokens(chainId, [tokenAddress])

    if (!tokens.length) {
      throw new Error('Cannot find a ERC-20 token: ' + tokenAddress + ' in chain ' + chainId)
    }

    return tokens[0].decimals
  },
})
