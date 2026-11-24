import { useCallback, useSyncExternalStore } from 'react'

import { solanaProviderFromStandardWallet, type SolanaProvider, type StandardWallet } from '@cowprotocol/widget-lib'

import { getWallets } from '@wallet-standard/app'

const SOLANA_SIGN_TRANSACTION = 'solana:signTransaction'

export interface HostSolanaWallet {
  address: string | null
  name: string | null
  solanaProvider: SolanaProvider | undefined
}

export interface NamedStandardWallet extends StandardWallet {
  readonly name: string
}

interface HostSolanaWalletStore extends HostSolanaWallet {
  wallets: readonly NamedStandardWallet[]
}

const EMPTY_STATE: HostSolanaWalletStore = {
  address: null,
  name: null,
  solanaProvider: undefined,
  wallets: [],
}

const listeners = new Set<() => void>()
let state: HostSolanaWalletStore = EMPTY_STATE

function isSolanaCapable(wallet: { features: Readonly<Record<string, unknown>> }): boolean {
  return SOLANA_SIGN_TRANSACTION in wallet.features
}

function setState(next: Partial<HostSolanaWalletStore>): void {
  state = { ...state, ...next }
  listeners.forEach((listener) => listener())
}

/**
 * Mirrors what a dapp-mode partner does: read the browser's Wallet Standard registry, which is
 * where Phantom, Solflare and the rest announce themselves, and keep the compatible ones listed.
 */
function startWatchingWallets(): void {
  const { get, on } = getWallets()

  const refresh = (): void => {
    setState({ wallets: get().filter(isSolanaCapable) as readonly NamedStandardWallet[] })
  }

  on('register', refresh)
  on('unregister', refresh)
  refresh()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

startWatchingWallets()

export function useHostSolanaWallet(): HostSolanaWallet {
  return useSyncExternalStore(subscribe, () => state)
}

export function useHostSolanaWalletControls(): {
  connect: (wallet: NamedStandardWallet) => Promise<void>
  disconnect: () => Promise<void>
  wallets: readonly NamedStandardWallet[]
} {
  const { wallets } = useSyncExternalStore(subscribe, () => state)

  const connect = useCallback(async (wallet: NamedStandardWallet): Promise<void> => {
    const solanaProvider = solanaProviderFromStandardWallet(wallet)
    const [address] = await solanaProvider.connect()

    if (!address) {
      throw new Error(`${wallet.name} did not return a Solana account.`)
    }

    setState({ address, name: wallet.name, solanaProvider })
  }, [])

  const disconnect = useCallback(async (): Promise<void> => {
    await state.solanaProvider?.disconnect()
    setState({ address: null, name: null, solanaProvider: undefined })
  }, [])

  return { connect, disconnect, wallets }
}
