import { useCallback, useEffect, useRef, useState } from 'react'

import { captureError, normalizeError } from '@cowprotocol/common-utils'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

import { Buffer } from 'buffer'

type Connection = NonNullable<ReturnType<typeof useAppKitConnection>['connection']>

interface ParsedTokenAccount {
  parsed?: { info?: { tokenAmount?: { amount?: string } } }
}

/**
 * Wall-token balance of the connected wallet, read from the associated token
 * account the claim funds and the burn debits. Refreshed when `refreshKey`
 * changes and, if `pollMs` is given, on that interval. A failed read keeps the
 * last value.
 */
export function useTokenBalance(
  owner: string | null | undefined,
  mint: string | null | undefined,
  refreshKey: unknown,
  pollMs?: number,
): number | null {
  const { connection } = useAppKitConnection()
  const [balance, setBalance] = useState<number | null>(null)
  const reportedFailure = useRef(false)

  const refresh = useCallback(async (): Promise<void> => {
    if (!connection || !owner || !mint) return

    try {
      setBalance(await readAtaBalance(connection, owner, mint))
      reportedFailure.current = false
    } catch (err: unknown) {
      // Keep the last known balance, but report it: callers render null as a loading
      // state, so a silently swallowed failure is indistinguishable from a slow read.
      if (reportedFailure.current) return

      reportedFailure.current = true
      captureError(normalizeError(err), undefined, { mint, owner }, { scope: 'GraffitiTokenBalance' })
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

/**
 * Reads the one derived account rather than enumerating the owner's accounts:
 * getParsedTokenAccountsByOwner is an indexed request, which keyless RPC providers
 * refuse outright (publicnode answers 403).
 */
async function readAtaBalance(connection: Connection, owner: string, mint: string): Promise<number> {
  const ata = getAssociatedTokenAddressSync(new PublicKey(mint), new PublicKey(owner))
  const data = (await connection.getParsedAccountInfo(ata)).value?.data as ParsedTokenAccount | Buffer | undefined

  // No account yet means nothing was ever sent here, which is a balance of zero.
  if (!data || Buffer.isBuffer(data)) return 0

  return Number(data.parsed?.info?.tokenAmount?.amount || 0)
}
