import { useMemo } from 'react'

import { isSolanaAddress } from '@cowprotocol/cow-sdk'
import { useSolanaWalletProvider } from '@cowprotocol/wallet'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { PublicKey } from '@solana/web3.js'

import { SolanaTradeFlowContext } from '../types/TradeFlowContext'

export function useSolanaSigner(account: string | null | undefined): SolanaTradeFlowContext['solana'] | null {
  const provider = useSolanaWalletProvider()
  const { connection } = useAppKitConnection()

  return useMemo(() => {
    if (!provider || !connection || !isSolanaAddress(account)) return null

    return { connection, provider, owner: new PublicKey(account) }
  }, [provider, connection, account])
}
