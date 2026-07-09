import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'

const mockWagmiConfig = createConfig({
  chains: [mainnet],
  transports: { [mainnet.id]: http() },
})

export class WagmiAdapter {
  wagmiConfig = mockWagmiConfig

  constructor() {}
}
