import { setGlobalAdapter, AbstractProviderAdapter } from '@cowprotocol/cow-sdk'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'

import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const cowSdkAdapter = new ViemAdapter({
  provider: createPublicClient({ chain: mainnet, transport: http(mainnet.rpcUrls.default.http[0]) }),
}) as AbstractProviderAdapter

setGlobalAdapter(cowSdkAdapter)
