import { SolanaProvider, SolanaProviderEvent, SolanaProviderEventHandler } from '@cowprotocol/iframe-transport'

const STANDARD_CONNECT = 'standard:connect'
const STANDARD_DISCONNECT = 'standard:disconnect'
const STANDARD_EVENTS = 'standard:events'
const SOLANA_SIGN_TRANSACTION = 'solana:signTransaction'

/**
 * The parts of a Wallet Standard wallet this adapter needs.
 *
 * Structural on purpose: widget-lib ships to partners, and pulling the `@wallet-standard/*`
 * packages in just to name these four features would land in every host bundle.
 */
export interface StandardWallet {
  readonly accounts: readonly StandardWalletAccount[]
  readonly features: Readonly<Record<string, unknown>>
}

export interface StandardWalletAccount {
  readonly address: string
}

interface StandardChangeProperties {
  accounts?: readonly StandardWalletAccount[]
}

interface StandardConnectFeature {
  connect(): Promise<{ accounts: readonly StandardWalletAccount[] }>
}

interface StandardDisconnectFeature {
  disconnect(): Promise<void>
}

interface StandardEventsFeature {
  on(event: 'change', listener: (properties: StandardChangeProperties) => void): () => void
}

interface StandardSignTransactionFeature {
  signTransaction(
    ...inputs: readonly { account: StandardWalletAccount; transaction: Uint8Array }[]
  ): Promise<readonly { signedTransaction: Uint8Array }[]>
}

/**
 * Adapts a Wallet Standard wallet — what every browser Solana wallet registers itself as — into the
 * {@link SolanaProvider} the widget expects, so a dapp-mode host can pass its connected wallet
 * straight through:
 *
 * ```ts
 * createCowSwapWidget(container, {
 *   params: { appCode: 'my-app', standaloneMode: false, enableSolana: true },
 *   provider: evmProvider,
 *   solanaProvider: solanaProviderFromStandardWallet(wallet),
 * })
 * ```
 *
 * @throws {Error} When the wallet cannot sign Solana transactions.
 */
export function solanaProviderFromStandardWallet(wallet: StandardWallet): SolanaProvider {
  const signFeature = getFeature<StandardSignTransactionFeature>(wallet, SOLANA_SIGN_TRANSACTION)

  if (!signFeature) {
    throw new Error(`The wallet does not support "${SOLANA_SIGN_TRANSACTION}" and cannot be used by the CoW widget.`)
  }

  const unsubscribeByHandler = new Map<SolanaProviderEventHandler, () => void>()

  return {
    async connect(): Promise<string[]> {
      const connectFeature = getFeature<StandardConnectFeature>(wallet, STANDARD_CONNECT)
      const accounts = connectFeature ? (await connectFeature.connect()).accounts : wallet.accounts

      return accounts.map((account) => account.address)
    },

    async disconnect(): Promise<void> {
      await getFeature<StandardDisconnectFeature>(wallet, STANDARD_DISCONNECT)?.disconnect()
    },

    async signTransactions(transactionsBase64: string[]): Promise<string[]> {
      const account = wallet.accounts[0]

      if (!account) {
        throw new Error('The wallet has no connected Solana account to sign with.')
      }

      const signed = await signFeature.signTransaction(
        ...transactionsBase64.map((transactionBase64) => ({
          account,
          transaction: decodeBase64(transactionBase64),
        })),
      )

      return signed.map(({ signedTransaction }) => encodeBase64(signedTransaction))
    },

    on(event: SolanaProviderEvent, handler: SolanaProviderEventHandler): void {
      const eventsFeature = getFeature<StandardEventsFeature>(wallet, STANDARD_EVENTS)

      if (!eventsFeature) return

      // Wallet Standard has one `change` event rather than separate account/disconnect ones:
      // an empty `accounts` is how a wallet says it disconnected.
      const off = eventsFeature.on('change', ({ accounts }) => {
        if (!accounts) return

        const addresses = accounts.map((account) => account.address)
        const isDisconnect = addresses.length === 0

        if (isDisconnect === (event === SolanaProviderEvent.DISCONNECT)) {
          handler(addresses)
        }
      })

      unsubscribeByHandler.set(handler, off)
    },

    removeListener(_event: SolanaProviderEvent, handler: SolanaProviderEventHandler): void {
      unsubscribeByHandler.get(handler)?.()
      unsubscribeByHandler.delete(handler)
    },
  }
}

function decodeBase64(value: string): Uint8Array {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  return bytes
}

function encodeBase64(bytes: Uint8Array): string {
  // Chunked because `String.fromCharCode(...bytes)` blows the argument limit on a big transaction.
  const CHUNK_SIZE = 0x8000
  let binary = ''

  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK_SIZE))
  }

  return btoa(binary)
}

function getFeature<T>(wallet: StandardWallet, name: string): T | undefined {
  const feature = wallet.features[name]

  return feature ? (feature as T) : undefined
}
