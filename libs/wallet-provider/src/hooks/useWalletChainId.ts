import { useConnection } from 'wagmi'

/**
 * Returns the actual chainId of the connected wallet, even when it's on an
 * unsupported chain.
 *
 * Wagmi's `useChainId()` reads from `config.state.chainId`, which is only
 * updated when the wallet switches to a *configured* chain (see createConfig
 * subscriber that short-circuits on `!isChainConfigured`). That masks
 * unsupported chains behind the last supported one and breaks any code that
 * needs to detect an unsupported-network state. Reading straight from the
 * active connection preserves the real chain.
 */
export function useWalletChainId(): number | undefined {
  return useConnection().chainId
}
