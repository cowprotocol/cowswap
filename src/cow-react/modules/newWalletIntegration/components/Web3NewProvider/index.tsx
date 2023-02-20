import { ReactNode } from 'react'
import { WagmiConfig, createClient, configureChains, mainnet } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'

const { provider, webSocketProvider } = configureChains([mainnet], [publicProvider()])

const client = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
})

export function Web3NewProvider({ children }: { children: ReactNode }) {
  return <WagmiConfig client={client}>{children}</WagmiConfig>
}
