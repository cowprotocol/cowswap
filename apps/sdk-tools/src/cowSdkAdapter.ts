import { RPC_URLS, VIEM_CHAINS } from '@cowprotocol/common-const'
import { setGlobalAdapter, AbstractProviderAdapter, SupportedChainId } from '@cowprotocol/cow-sdk'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'

import { createPublicClient, http } from 'viem'

export const cowSdkAdapter = new ViemAdapter({
  provider: createPublicClient({
    chain: VIEM_CHAINS[SupportedChainId.MAINNET],
    transport: http(RPC_URLS[SupportedChainId.MAINNET]),
  }),
}) as AbstractProviderAdapter

setGlobalAdapter(cowSdkAdapter)
