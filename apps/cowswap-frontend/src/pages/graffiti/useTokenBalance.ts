import { useCallback, useEffect, useState } from 'react'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { PublicKey } from '@solana/web3.js'

interface ParsedTokenAccount {
  parsed?: { info?: { tokenAmount?: { amount?: string } } }
}

/**
 * Best-effort wall-token balance of the connected wallet, summed across every
 * token account it owns for the mint. Refreshed when `refreshKey` changes and,
 * if `pollMs` is given, on that interval. A failed read keeps the last value.
 */
export function useTokenBalance(
  owner: string | null | undefined,
  mint: string | null | undefined,
  refreshKey: unknown,
  pollMs?: number,
): number | null {
  const { connection } = useAppKitConnection()
  const [balance, setBalance] = useState<number | null>(null)

  const refresh = useCallback(async (): Promise<void> => {
    if (!connection || !owner || !mint) return

    try {
      const res = await connection.getParsedTokenAccountsByOwner(new PublicKey(owner), {
        mint: new PublicKey(mint),
      })

      let total = 0

      for (const { account } of res.value) {
        const parsed = (account.data as ParsedTokenAccount).parsed

        total += Number(parsed?.info?.tokenAmount?.amount || 0)
      }

      setBalance(total)
    } catch {
      // keep the last known balance
    }
  }, [connection, mint, owner])

  useEffect(() => {
    void refresh()

    if (!pollMs) return

    const timer = setInterval(() => void refresh(), pollMs)

    return () => clearInterval(timer)
  }, [refresh, refreshKey, pollMs])

  return balance
}
