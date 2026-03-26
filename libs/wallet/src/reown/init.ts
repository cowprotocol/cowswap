// Re-export from wagmi config so config and WagmiProvider share the same types (avoids Config version mismatch).
export { reownAppKit, wagmiAdapter } from '../wagmi/config'
import { wagmiAdapter } from '../wagmi/config'

export const reownWagmiConfig = wagmiAdapter.wagmiConfig
