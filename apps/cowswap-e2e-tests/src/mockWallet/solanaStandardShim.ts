export interface SolanaStandardShimConfig {
  address: string
  publicKeyBase64: string
  name: string
  icon: string
  /** Wallet Standard chain id (`solana:mainnet`), which is not the CAIP id Reown uses elsewhere. */
  chain: string
}

export const E2E_SOLANA_WALLET_INFO: Omit<SolanaStandardShimConfig, 'address' | 'publicKeyBase64'> = {
  name: 'E2E Solana Wallet',
  chain: 'solana:mainnet',
  icon:
    'data:image/svg+xml;base64,' +
    Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" rx="6" fill="#9945ff"/><text x="16" y="21" font-size="12" text-anchor="middle" fill="#fff">SOL</text></svg>',
    ).toString('base64'),
}

/**
 * Installed via `context.addInitScript(solanaStandardShim, cfg)` — the function is SERIALIZED into
 * the page, so it must not reference any imports or captured identifiers, and the Wallet Standard
 * feature names below are inlined string literals rather than the exported constants.
 *
 * Registers a Solana wallet that Reown's `watchStandard()` accepts. Its filter is
 * `isWalletAdapterCompatibleStandardWallet`, which requires `standard:connect`, `standard:events`
 * and either `solana:signTransaction` or `solana:signAndSendTransaction` — so those three features
 * are the contract, not a convenience.
 */
// eslint-disable-next-line max-lines-per-function
export function solanaStandardShim(cfg: SolanaStandardShimConfig): void {
  interface WalletAccountLike {
    address: string
    publicKey: Uint8Array
    chains: string[]
    features: string[]
  }

  interface SignTransactionInput {
    transaction: Uint8Array
  }

  const changeListeners = new Set<(properties: { accounts: readonly WalletAccountLike[] }) => void>()

  const publicKey = Uint8Array.from(atob(cfg.publicKeyBase64), (character) => character.charCodeAt(0))

  const account: WalletAccountLike = {
    address: cfg.address,
    publicKey,
    chains: [cfg.chain],
    features: ['solana:signTransaction'],
  }

  // Wallet Standard wallets expose no accounts until `connect()` resolves, and AppKit reads
  // `wallet.accounts[0]` straight afterwards — starting populated would mask a broken connect.
  let accounts: WalletAccountLike[] = []

  function emitChange(): void {
    changeListeners.forEach((listener) => listener({ accounts }))
  }

  function toBase64(bytes: Uint8Array): string {
    let binary = ''
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte)
    })

    return btoa(binary)
  }

  async function signTransaction(
    ...inputs: readonly SignTransactionInput[]
  ): Promise<readonly { signedTransaction: Uint8Array }[]> {
    const bridge = (window as never as { __e2eSolanaWalletSign(transactionsBase64: string[]): Promise<string[]> })
      .__e2eSolanaWalletSign
    const signed = await bridge(inputs.map((input) => toBase64(input.transaction)))

    return signed.map((signedBase64) => ({
      signedTransaction: Uint8Array.from(atob(signedBase64), (character) => character.charCodeAt(0)),
    }))
  }

  const wallet = {
    version: '1.0.0',
    name: cfg.name,
    icon: cfg.icon,
    chains: [cfg.chain],
    get accounts() {
      return accounts
    },
    features: {
      'standard:connect': {
        version: '1.0.0',
        connect: async () => {
          accounts = [account]
          emitChange()

          return { accounts }
        },
      },
      'standard:disconnect': {
        version: '1.0.0',
        disconnect: async () => {
          accounts = []
          emitChange()
        },
      },
      'standard:events': {
        version: '1.0.0',
        on: (event: string, listener: (properties: { accounts: readonly WalletAccountLike[] }) => void) => {
          if (event !== 'change') return () => undefined

          changeListeners.add(listener)

          return () => changeListeners.delete(listener)
        },
      },
      'solana:signTransaction': {
        version: '1.0.0',
        supportedTransactionVersions: ['legacy', 0],
        signTransaction,
      },
    },
  }

  // Lets a spec drop the wallet mid-test, the way a user disconnecting in their extension would.
  ;(window as never as { __e2eSolanaWalletDisconnect(): void }).__e2eSolanaWalletDisconnect = () => {
    accounts = []
    emitChange()
  }

  // Inlined `registerWallet` from `@wallet-standard/wallet`: dispatch for an app that is already
  // listening, plus a listener for one that starts later. Either order ends up registered.
  const register = ({ register: registerWallet }: { register(wallet: unknown): void }): void => registerWallet(wallet)

  try {
    window.dispatchEvent(new CustomEvent('wallet-standard:register-wallet', { detail: register }))
  } catch {
    // The app may not be listening yet; the handler below covers that case.
  }

  try {
    window.addEventListener('wallet-standard:app-ready', (event) =>
      register((event as CustomEvent<{ register(wallet: unknown): void }>).detail),
    )
  } catch {
    // Nothing else to try — the dispatch above was the other half.
  }
}
