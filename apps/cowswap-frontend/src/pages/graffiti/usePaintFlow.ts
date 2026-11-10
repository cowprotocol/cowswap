// quote → burn → deliver the proof. The burn is irreversible, so everything
// after sendTransaction is recorded (see pendingBurn.utils) and retried.

import { useCallback, useEffect, useRef, useState } from 'react'

import { useSolanaWalletProvider } from '@cowprotocol/wallet'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { createBurnCheckedInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'

import { Buffer } from 'buffer'

import { getInfo, postClientError, type CanvasInfo } from './graffiti.service'
import { loadPendingBurn, savePendingBurn, type PendingBurn } from './pendingBurn.utils'
import { CANVAS, type Cell } from './raster.utils'
import { submitDraw } from './submitDraw.service'
import { TOKEN_SYMBOL } from './wall.constants'

export type PaintPhase = 'idle' | 'quoting' | 'awaiting wallet' | 'confirming' | 'painting' | 'done' | 'error'

const SPL_MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr')

/** Minimum lamports needed to pay for the burn transaction. */
const MIN_FEE_LAMPORTS = 5000

export interface PaintFlow {
  phase: PaintPhase
  phaseError: string | null
  paint: () => Promise<void>
  setPhase: (phase: PaintPhase) => void
  setPhaseError: (error: string | null) => void
}

export interface UsePaintFlowParams {
  /** Draft cells, keyed by `y * CANVAS.w + x`. */
  draft: Map<number, number>
  solanaAccount: string | null | undefined
  info: CanvasInfo | null
  /** Called once the wall has accepted the draw. */
  onApplied: (seq: number) => void
}

type Connection = NonNullable<ReturnType<typeof useAppKitConnection>['connection']>

interface ParsedAta {
  parsed?: { info?: { tokenAmount?: { uiAmount?: number | null } } }
}

export function usePaintFlow({ draft, solanaAccount, info, onApplied }: UsePaintFlowParams): PaintFlow {
  const provider = useSolanaWalletProvider()
  const { connection } = useAppKitConnection()

  const [phase, setPhase] = useState<PaintPhase>('idle')
  const [phaseError, setPhaseError] = useState<string | null>(null)

  /** Hand a burn to the wall, retrying transient failures. */
  const deliverBurn = useCallback(
    async (burn: PendingBurn): Promise<void> => {
      setPhase('painting')
      setPhaseError(null)

      const outcome = await submitDraw(burn, (attempt, max) => {
        if (attempt > 1) setPhaseError(`Confirming your burn with the wall (attempt ${attempt}/${max})…`)
      })

      if (outcome.ok) {
        setPhaseError(null)
        setPhase('done')
        onApplied(outcome.seq)

        return
      }

      setPhase('error')
      setPhaseError(
        outcome.recoverable
          ? `${outcome.reason}. Your tokens are burned and safe — reload this page to finish painting.`
          : outcome.reason,
      )
    },
    [onApplied],
  )

  useResumePendingBurn(solanaAccount, deliverBurn)

  useAutoIdle(phase, setPhase)

  const paint = useCallback(async (): Promise<void> => {
    if (draft.size === 0 || !solanaAccount || !provider || !connection) return

    const cellsPayload: Array<Cell> = Array.from(draft.entries()).map(([idx, color]) => ({
      x: idx % CANVAS.w,
      y: Math.floor(idx / CANVAS.w),
      color,
    }))
    const amount = cellsPayload.length

    try {
      setPhase('quoting')
      setPhaseError(null)

      const owner = new PublicKey(solanaAccount)
      const checked = await runPreflight(connection, owner, amount, info)

      if (!checked.ok) {
        setPhase('error')
        setPhaseError(checked.reason)

        return
      }

      setPhase('awaiting wallet')

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      const transaction = buildBurnTransaction({
        mint: checked.mint,
        owner,
        amount,
        blockhash,
        lastValidBlockHeight,
      })
      const signature = await provider.sendTransaction(transaction, connection)

      // The tokens are gone from here on. Record the burn before anything else
      // can fail, so a reload or a backend hiccup cannot destroy it.
      const burn: PendingBurn = {
        txSignature: signature,
        walletPubkey: solanaAccount,
        cells: cellsPayload,
        createdAt: Date.now(),
      }

      savePendingBurn(burn)
      setPhase('confirming')
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')
      await deliverBurn(burn)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)

      void postClientError({
        message,
        wallet: solanaAccount ?? undefined,
        detail: JSON.stringify({ amount, cells: cellsPayload.length, mint: info?.mint }),
      })
      setPhase('error')
      setPhaseError(message)
    }
  }, [connection, deliverBurn, draft, info, provider, solanaAccount])

  return { phase, phaseError, paint, setPhase, setPhaseError }
}

/** BurnChecked(amount) + the memo the backend matches the draw against. */
function buildBurnTransaction(params: {
  mint: PublicKey
  owner: PublicKey
  amount: number
  blockhash: string
  lastValidBlockHeight: number
}): Transaction {
  const { mint, owner, amount, blockhash, lastValidBlockHeight } = params
  const ata = getAssociatedTokenAddressSync(mint, owner)
  // Minted as late as possible: the backend checks this against its freshness
  // window, and a slow wallet prompt would otherwise stale it out.
  const memo = `graffiti:v1:${owner.toBase58()}:${Math.floor(Date.now() / 1000)}`

  return new Transaction({ feePayer: owner, blockhash, lastValidBlockHeight }).add(
    createBurnCheckedInstruction(ata, mint, owner, amount, 0, []),
    new TransactionInstruction({
      programId: SPL_MEMO_PROGRAM_ID,
      keys: [{ pubkey: owner, isSigner: true, isWritable: false }],
      data: Buffer.from(memo, 'utf-8'),
    }),
  )
}

function isMainnet(network: string): boolean {
  return network === 'mainnet' || network === 'mainnet-beta'
}

/** Tokens the wallet holds in the exact account the burn will debit. */
async function readAtaBalance(connection: Connection, mint: PublicKey, owner: PublicKey): Promise<number> {
  const ata = getAssociatedTokenAddressSync(mint, owner)
  const info = await connection.getParsedAccountInfo(ata)
  const data = info.value?.data as ParsedAta | Buffer | undefined

  if (!data || Buffer.isBuffer(data) || !data.parsed) return 0

  return data.parsed.info?.tokenAmount?.uiAmount ?? 0
}

/**
 * Confirm the wallet can actually pay before prompting it: a burn from an
 * unfunded account fails with an opaque simulation error.
 */
async function runPreflight(
  connection: Connection,
  owner: PublicKey,
  amount: number,
  info: CanvasInfo | null,
): Promise<{ ok: true; mint: PublicKey } | { ok: false; reason: string }> {
  const canvasInfo = info ?? (await getInfo())

  if (!canvasInfo.mint) {
    return { ok: false, reason: 'The wall is not configured with a token yet — painting is disabled.' }
  }

  const mint = new PublicKey(canvasInfo.mint)
  const lamports = await connection.getBalance(owner)

  if (lamports < MIN_FEE_LAMPORTS) {
    return {
      ok: false,
      reason: isMainnet(canvasInfo.network)
        ? `This wallet has no SOL for the transaction fee. Add a little SOL and try again (your ${TOKEN_SYMBOL} are fine).`
        : `This wallet has no ${canvasInfo.network} SOL for the transaction fee. Open faucet.solana.com, paste your address, and try again (your ${TOKEN_SYMBOL} are fine).`,
    }
  }

  const held = await readAtaBalance(connection, mint, owner)

  if (held < amount) {
    return {
      ok: false,
      reason: `This wallet holds ${Math.floor(held)} ${TOKEN_SYMBOL} but the draft needs ${amount}. Claim a code with THIS wallet first (see the balance above the frame).`,
    }
  }

  return { ok: true, mint }
}

/** Drop the success banner back to idle without leaking the timer. */
function useAutoIdle(phase: PaintPhase, setPhase: (phase: PaintPhase) => void): void {
  useEffect(() => {
    if (phase !== 'done') return

    const timer = setTimeout(() => setPhase('idle'), 2500)

    return () => clearTimeout(timer)
  }, [phase, setPhase])
}

/**
 * A burn recorded by a previous session (reload, crash, lost connection) still
 * owes the user pixels: finish it before anything else.
 */
function useResumePendingBurn(
  solanaAccount: string | null | undefined,
  deliverBurn: (burn: PendingBurn) => Promise<void>,
): void {
  const resumedRef = useRef(false)

  useEffect(() => {
    if (resumedRef.current || !solanaAccount) return

    const pending = loadPendingBurn()

    if (!pending || pending.walletPubkey !== solanaAccount) return

    resumedRef.current = true
    void deliverBurn(pending)
  }, [deliverBurn, solanaAccount])
}
