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

const WALLET_UNAVAILABLE = 'Your Solana wallet is no longer connected to this page. Reconnect it and try again.'

/** Minimum lamports needed to pay for the burn transaction. */
const MIN_FEE_LAMPORTS = 5000

/**
 * Stop waiting on our own RPC after this long and let the wall verify instead:
 * the backend only accepts a burn for a few minutes, so a confirmation that
 * never arrives must not eat that budget.
 */
const CONFIRM_TIMEOUT_MS = 30_000

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

type BurnStart = { ok: true; burn: PendingBurn; strategy: ConfirmStrategy } | { ok: false; reason: string }

/** What `confirmTransaction` needs to know when a burn expires. */
interface ConfirmStrategy {
  signature: string
  blockhash: string
  lastValidBlockHeight: number
}

type Connection = NonNullable<ReturnType<typeof useAppKitConnection>['connection']>

interface ParsedAta {
  parsed?: { info?: { tokenAmount?: { uiAmount?: number | null } } }
}

type SolanaProvider = NonNullable<ReturnType<typeof useSolanaWalletProvider>>

export function usePaintFlow({ draft, solanaAccount, info, onApplied }: UsePaintFlowParams): PaintFlow {
  const provider = useSolanaWalletProvider()
  const { connection } = useAppKitConnection()

  const [phase, setPhase] = useState<PaintPhase>('idle')
  const [phaseError, setPhaseError] = useState<string | null>(null)

  // The backend consumes a signature exactly once, so two deliveries of the
  // same burn race and the loser is told it was 'already used'.
  const deliveringRef = useRef<string | null>(null)

  /** Hand a burn to the wall, retrying transient failures. */
  const deliverBurn = useCallback(
    async (burn: PendingBurn): Promise<void> => {
      if (deliveringRef.current === burn.txSignature) return

      deliveringRef.current = burn.txSignature
      setPhase('painting')
      setPhaseError(null)

      try {
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
        setPhaseError(outcome.recoverable ? burnedAndSafe(outcome.reason) : outcome.reason)
      } finally {
        deliveringRef.current = null
      }
    },
    [onApplied],
  )

  useResumePendingBurn(solanaAccount, deliverBurn)

  useAutoIdle(phase, setPhase)

  const paint = useCallback(async (): Promise<void> => {
    if (draft.size === 0) return

    // The page gates painting on the account, but only the provider can sign: when they
    // disagree the click has to say so instead of doing nothing.
    if (!solanaAccount || !provider || !connection) {
      setPhase('error')
      setPhaseError(WALLET_UNAVAILABLE)

      return
    }

    const owed = loadPendingBurn()

    // Already paid for: burning a second time would charge twice.
    if (owed && owed.walletPubkey === solanaAccount) return deliverBurn(owed)

    const cells = draftToCells(draft)

    try {
      setPhaseError(null)

      const started = await startBurn({ cells, connection, info, onPhase: setPhase, owner: solanaAccount, provider })

      if (!started.ok) {
        setPhase('error')
        setPhaseError(started.reason)

        return
      }

      setPhase('confirming')
      await confirmQuietly(connection, started.strategy)
      await deliverBurn(started.burn)
    } catch (err: unknown) {
      setPhase('error')
      setPhaseError(handleBurnFailure(err, solanaAccount, { cells: cells.length, mint: info?.mint }))
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

function burnedAndSafe(reason: string): string {
  return `${reason}. Your ${TOKEN_SYMBOL} are burned and safe — reload this page to finish painting.`
}

/**
 * A blockhash expiring means this RPC stopped watching, not that the burn
 * failed. The wall re-reads the chain itself, so a sent burn is never
 * abandoned over a confirmation that did not arrive here.
 */
async function confirmQuietly(connection: Connection, strategy: ConfirmStrategy): Promise<void> {
  try {
    await Promise.race([connection.confirmTransaction(strategy, 'confirmed'), delay(CONFIRM_TIMEOUT_MS)])
  } catch {
    /* the wall is the authority on whether the burn landed */
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function draftToCells(draft: Map<number, number>): Array<Cell> {
  return Array.from(draft.entries()).map(([idx, color]) => ({
    x: idx % CANVAS.w,
    y: Math.floor(idx / CANVAS.w),
    color,
  }))
}

/** Report the failure, and say whether the tokens behind it can still land. */
function handleBurnFailure(err: unknown, owner: string, detail: Record<string, unknown>): string {
  const message = err instanceof Error ? err.message : String(err)
  // A record under this wallet can only be the burn just started: any
  // pre-existing one was resumed before the attempt.
  const recorded = loadPendingBurn()?.walletPubkey === owner

  void postClientError({ message, wallet: owner, detail: JSON.stringify({ ...detail, recorded }) })

  return recorded ? burnedAndSafe(message) : message
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

/**
 * Preflight, prompt the wallet, and record the burn the instant a signature
 * exists — after that point the tokens are gone and only the record can get
 * them back onto the wall.
 */
async function startBurn(params: {
  cells: Array<Cell>
  connection: Connection
  info: CanvasInfo | null
  onPhase: (phase: PaintPhase) => void
  owner: string
  provider: SolanaProvider
}): Promise<BurnStart> {
  const { cells, connection, info, onPhase, owner, provider } = params
  const ownerKey = new PublicKey(owner)

  onPhase('quoting')

  const checked = await runPreflight(connection, ownerKey, cells.length, info)

  if (!checked.ok) return checked

  onPhase('awaiting wallet')

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
  const transaction = buildBurnTransaction({
    mint: checked.mint,
    owner: ownerKey,
    amount: cells.length,
    blockhash,
    lastValidBlockHeight,
  })
  const signature = await provider.sendTransaction(transaction, connection)
  const burn: PendingBurn = { txSignature: signature, walletPubkey: owner, cells, createdAt: Date.now() }

  savePendingBurn(burn)

  return { ok: true, burn, strategy: { signature, blockhash, lastValidBlockHeight } }
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
