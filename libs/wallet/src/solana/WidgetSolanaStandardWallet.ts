import { SolanaProviderEvent, WidgetSolanaProvider } from '@cowprotocol/iframe-transport'

import {
  SolanaSignTransaction,
  type SolanaSignTransactionFeature,
  type SolanaSignTransactionInput,
  type SolanaSignTransactionOutput,
} from '@solana/wallet-standard-features'
import { PublicKey } from '@solana/web3.js'
import {
  StandardConnect,
  type StandardConnectFeature,
  StandardDisconnect,
  type StandardDisconnectFeature,
  StandardEvents,
  type StandardEventsFeature,
  type StandardEventsListeners,
  type StandardEventsNames,
} from '@wallet-standard/features'

import { IS_SOLANA_DEVNET } from '../reown/solanaNetwork'

import type { IdentifierString, Wallet, WalletAccount } from '@wallet-standard/base'

export const WIDGET_SOLANA_WALLET_NAME = 'CoW Widget'

const WIDGET_SOLANA_WALLET_ICON =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzA1MkI2NSIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjgiIGZpbGw9IiM2NUQ5RkYiLz48L3N2Zz4=' as const

// Wallet Standard chain identifiers, which are not the CAIP ids Reown uses elsewhere.
const WIDGET_SOLANA_WALLET_CHAINS: readonly IdentifierString[] = [IS_SOLANA_DEVNET ? 'solana:devnet' : 'solana:mainnet']

type WidgetSolanaWalletFeatures = SolanaSignTransactionFeature &
  StandardConnectFeature &
  StandardDisconnectFeature &
  StandardEventsFeature

/**
 * Presents the host dapp's Solana wallet to the widget as a Wallet Standard wallet.
 *
 * Reown's Solana adapter discovers wallets through `watchStandard()` rather than through any
 * adapter option, so registering here is what makes `useAppKitProvider('solana')` — and every
 * hook built on it — resolve to the host's wallet without any of them knowing about the iframe.
 */
export class WidgetSolanaStandardWallet implements Wallet {
  readonly version = '1.0.0' as const
  readonly name = WIDGET_SOLANA_WALLET_NAME
  readonly icon = WIDGET_SOLANA_WALLET_ICON
  readonly chains = WIDGET_SOLANA_WALLET_CHAINS

  private account: WalletAccount | null = null
  private readonly changeListeners = new Set<StandardEventsListeners['change']>()
  private readonly walletFeatures: WidgetSolanaWalletFeatures

  constructor(private readonly provider: WidgetSolanaProvider) {
    this.walletFeatures = {
      [StandardConnect]: { version: '1.0.0', connect: this.connect },
      [StandardDisconnect]: { version: '1.0.0', disconnect: this.disconnect },
      [StandardEvents]: { version: '1.0.0', on: this.on },
      [SolanaSignTransaction]: {
        version: '1.0.0',
        supportedTransactionVersions: ['legacy', 0],
        signTransaction: this.signTransaction,
      },
    }

    provider.on(SolanaProviderEvent.ACCOUNTS_CHANGED, (accounts) => this.setAccounts(accounts))
    provider.on(SolanaProviderEvent.DISCONNECT, () => this.setAccounts([]))
  }

  get accounts(): readonly WalletAccount[] {
    return this.account ? [this.account] : []
  }

  get features(): WidgetSolanaWalletFeatures {
    return this.walletFeatures
  }

  private connect = async (): Promise<{ accounts: readonly WalletAccount[] }> => {
    this.setAccounts(await this.provider.connect())

    return { accounts: this.accounts }
  }

  private disconnect = async (): Promise<void> => {
    await this.provider.disconnect()
    this.setAccounts([])
  }

  private on = <E extends StandardEventsNames>(event: E, listener: StandardEventsListeners[E]): (() => void) => {
    if (event !== 'change') return () => void 0

    this.changeListeners.add(listener)

    return () => {
      this.changeListeners.delete(listener)
    }
  }

  private signTransaction = async (
    ...inputs: readonly SolanaSignTransactionInput[]
  ): Promise<readonly SolanaSignTransactionOutput[]> => {
    const signed = await this.provider.signTransactions(
      inputs.map(({ transaction }) => Buffer.from(transaction).toString('base64')),
    )

    return signed.map((transactionBase64) => ({
      signedTransaction: new Uint8Array(Buffer.from(transactionBase64, 'base64')),
    }))
  }

  private setAccounts(addresses: string[]): void {
    const [address] = addresses

    this.account = address ? this.buildAccount(address) : null

    this.changeListeners.forEach((listener) => listener({ accounts: this.accounts }))
  }

  private buildAccount(address: string): WalletAccount {
    return {
      address,
      publicKey: new PublicKey(address).toBytes(),
      chains: this.chains,
      features: [SolanaSignTransaction],
    }
  }
}
