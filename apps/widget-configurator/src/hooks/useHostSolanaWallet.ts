import { useMemo } from 'react'

import type { SolanaProvider } from '@cowprotocol/widget-lib'

import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { useDisconnect } from '@reown/appkit-controllers/react'
import { Transaction } from '@solana/web3.js'

import { reownAppKit } from '../wagmiConfig'

import type { Provider as AppKitSolanaProvider } from '@reown/appkit-adapter-solana/react'

export interface HostSolanaWallet {
  address: string | null
  solanaProvider: SolanaProvider | undefined
}

const DISCONNECTED: HostSolanaWallet = { address: null, solanaProvider: undefined }

/**
 * The Solana wallet this page has connected, shaped as the widget's `solanaProvider`.
 *
 * Mirrors what a dapp-mode partner does: dapp mode means the host owns the wallet, so the widget
 * cannot sign Solana transactions itself and signs through this object over the iframe transport.
 */
export function useHostSolanaWallet(): HostSolanaWallet {
  const { address } = useAppKitAccount({ namespace: 'solana' })
  const { walletProvider } = useAppKitProvider<AppKitSolanaProvider>('solana')

  // The widget reloads its iframe whenever this object's identity changes, so it must stay stable
  // for as long as the underlying wallet does.
  return useMemo(() => {
    if (!walletProvider || !address) return DISCONNECTED

    return { address, solanaProvider: toSolanaProvider(walletProvider, address) }
  }, [walletProvider, address])
}

export function useHostSolanaWalletControls(): {
  openConnectModal: () => void
  disconnect: () => Promise<void>
} {
  const { disconnect } = useDisconnect()

  return useMemo(
    () => ({
      openConnectModal: () => void reownAppKit.open({ view: 'Connect', namespace: 'solana' }),
      disconnect: () => disconnect({ namespace: 'solana' }),
    }),
    [disconnect],
  )
}

function decodeTransaction(transactionBase64: string): Transaction {
  return Transaction.from(Buffer.from(transactionBase64, 'base64'))
}

function encodeTransaction(transaction: Transaction): string {
  // The sponsor's signature slot stays empty until the back end fills it, so verifying signatures
  // here would throw on a transaction the user has correctly signed.
  return transaction.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64')
}

function toSolanaProvider(provider: AppKitSolanaProvider, address: string): SolanaProvider {
  return {
    connect: () => Promise.resolve([address]),
    disconnect: () => provider.disconnect(),
    signTransactions: async (transactionsBase64) => {
      const signed = await provider.signAllTransactions(transactionsBase64.map(decodeTransaction))

      return signed.map(encodeTransaction)
    },
  }
}
