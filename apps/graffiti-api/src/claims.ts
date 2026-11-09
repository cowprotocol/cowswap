import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
  getMint,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js'
import bs58 from 'bs58'

import fs from 'node:fs'

import { generateClaimCode } from './claimCode.js'
import { DEFAULT_CLAIM_AMOUNT } from './config.js'
import { errorMessage, parsePublicKey } from './util.js'

import type { Config } from './config.js'
import type { ClaimRow, Store } from './store.js'

export { generateClaimCode }

export type ClaimResult =
  | { ok: true; txSignature: string; amount: number }
  | { ok: false; status: number; reason: string }

type ClaimFailure = Extract<ClaimResult, { ok: false }>

interface SubmittedTransfer {
  signature: string
  blockhash: string
  lastValidBlockHeight: number
}

/**
 * Claim codes + on-chain transfer from the treasury ATA to the claimer
 * (spec §Claim flow). Codes are single-use; the transfer is paid and signed
 * by the treasury keypair.
 */
export class ClaimService {
  private connection: Connection | null = null
  private treasuryKeypair: Keypair | null | undefined
  private mintDecimals: number | null = null

  constructor(
    private readonly config: Config,
    private readonly store: Store,
    rpc: Connection | null = null,
  ) {
    this.connection = rpc
  }

  private conn(): Connection {
    if (!this.connection) this.connection = new Connection(this.config.rpcUrl, 'confirmed')
    return this.connection
  }

  private treasury(): Keypair | null {
    if (this.treasuryKeypair === undefined) {
      this.treasuryKeypair = loadTreasuryKeypair(this.config)
    }
    return this.treasuryKeypair
  }

  treasuryPubkey(): string | null {
    return this.treasury()?.publicKey.toBase58() ?? null
  }

  /** True when the service has everything it needs to settle a claim. */
  isConfigured(): boolean {
    return this.config.devInsecure || Boolean(this.config.mint && this.treasury())
  }

  private async decimals(mint: PublicKey): Promise<number> {
    if (this.mintDecimals === null) {
      this.mintDecimals = (await getMint(this.conn(), mint, undefined, TOKEN_PROGRAM_ID)).decimals
    }
    return this.mintDecimals
  }

  /** GET /claim/:code → {valid, amount} without revealing more. */
  check(code: string): { valid: boolean; amount: number } {
    const row = this.store.getClaim(code)
    if (!row || row.state !== 'unused') return { valid: false, amount: 0 }
    return { valid: true, amount: row.amount }
  }

  /** Generate n codes (admin/ops). Returns the created codes. */
  generate(n: number, amount: number = DEFAULT_CLAIM_AMOUNT): string[] {
    const codes: string[] = []
    for (let i = 0; i < n; i++) {
      const code = generateClaimCode()
      this.store.insertClaim(code, amount)
      codes.push(code)
    }
    return codes
  }

  /** The treasury key and mint needed to settle a claim, or null when unconfigured. */
  private payer(): { treasury: Keypair; mint: string } | null {
    const treasury = this.treasury()
    const mint = this.config.mint
    return treasury && mint ? { treasury, mint } : null
  }

  /** Why the server cannot settle claims, or null when it can. */
  private configurationError(): string | null {
    if (this.config.devInsecure) return null
    if (!this.config.mint) return 'server misconfigured: MINT not set'
    if (!this.treasury()) return 'server misconfigured: treasury key not set'
    return null
  }

  /**
   * Everything that can be rejected before touching the store or the chain.
   * Configuration is checked before reserving so a misconfigured server does
   * not burn through codes.
   */
  private prepareClaim(
    code: string,
    walletPubkey: string,
  ): { ok: true; row: ClaimRow; dest: PublicKey } | ClaimFailure {
    const row = this.store.getClaim(code)
    if (!row) return failure(404, 'unknown claim code')
    if (row.state !== 'unused') return failure(400, 'claim code already used')

    const dest = parsePublicKey(walletPubkey)
    if (!dest) return failure(400, 'invalid walletPubkey')
    if (!PublicKey.isOnCurve(dest.toBytes())) return failure(400, 'walletPubkey is not a wallet address')

    const misconfigured = this.configurationError()
    if (misconfigured) return failure(500, misconfigured)

    return { ok: true, row, dest }
  }

  /** POST /claim {code, walletPubkey} — transfer from treasury, mark used. */
  async claim(code: string, walletPubkey: string): Promise<ClaimResult> {
    const prepared = this.prepareClaim(code, walletPubkey)
    if (!prepared.ok) return prepared
    const { row, dest } = prepared

    // Reserve the code atomically before the (slow) on-chain work so two
    // concurrent claims cannot both succeed.
    if (!this.store.reserveClaim(code)) return failure(400, 'claim code already used')

    if (this.config.devInsecure) {
      const fake = `dev-insecure-${code}`
      this.store.settleClaim(code, fake)
      return { ok: true, txSignature: fake, amount: row.amount }
    }

    const payer = this.payer()
    if (!payer) {
      this.store.releaseClaim(code)
      return failure(500, 'server misconfigured')
    }

    return this.transfer(code, row.amount, dest, payer)
  }

  /**
   * Submit then confirm. The two phases fail differently: a failure before the
   * transaction is submitted cannot have moved funds, so the code is released;
   * a failure after it may have, so the code is parked for an operator.
   */
  private async transfer(
    code: string,
    amount: number,
    dest: PublicKey,
    payer: { treasury: Keypair; mint: string },
  ): Promise<ClaimResult> {
    let submitted: SubmittedTransfer
    try {
      submitted = await this.submitTransfer(amount, dest, payer)
    } catch (err: unknown) {
      this.store.releaseClaim(code)
      return failure(502, `claim transfer failed: ${errorMessage(err)}`)
    }
    return this.confirmTransfer(code, amount, submitted)
  }

  private async submitTransfer(
    amount: number,
    dest: PublicKey,
    payer: { treasury: Keypair; mint: string },
  ): Promise<SubmittedTransfer> {
    const conn = this.conn()
    const mint = new PublicKey(payer.mint)
    const decimals = await this.decimals(mint)
    const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash()
    const tx = buildTransferTransaction({
      treasury: payer.treasury,
      mint,
      dest,
      amount,
      decimals,
      blockhash,
      lastValidBlockHeight,
    })
    const signature = await conn.sendTransaction(tx, [payer.treasury])
    return { signature, blockhash, lastValidBlockHeight }
  }

  private async confirmTransfer(code: string, amount: number, submitted: SubmittedTransfer): Promise<ClaimResult> {
    try {
      const confirmation = await this.conn().confirmTransaction(submitted, 'confirmed')
      if (confirmation.value.err) {
        // The transaction landed and failed: nothing was transferred, so the
        // code is safe to hand back.
        this.store.releaseClaim(code)
        return failure(502, `claim transfer failed: ${JSON.stringify(confirmation.value.err)}`)
      }

      this.store.settleClaim(code, submitted.signature)
      return { ok: true, txSignature: submitted.signature, amount }
    } catch (err: unknown) {
      // Submitted but unconfirmed: the transfer may still land. Park the code
      // for an operator instead of releasing it and paying twice.
      this.store.failClaim(code, `unconfirmed ${submitted.signature}: ${errorMessage(err)}`)
      return failure(502, 'claim submitted but not confirmed; it is being reviewed — do not retry')
    }
  }
}

/**
 * Treasury signing key, from TREASURY_SECRET_KEY (base58 or JSON array) or a
 * JSON keypair file at TREASURY_KEYPAIR. The env form exists so deployments
 * can inject the key from a secret manager instead of shipping a file.
 */
export function loadTreasuryKeypair(config: Config): Keypair | null {
  const inline = config.treasurySecretKey
  if (inline) {
    const parsed = parseSecretKey(inline)
    if (parsed) return parsed
    console.error('[claims] TREASURY_SECRET_KEY is set but could not be parsed')
    return null
  }
  if (!config.treasuryKeypairPath) return null
  try {
    return parseSecretKey(fs.readFileSync(config.treasuryKeypairPath, 'utf8'))
  } catch (err: unknown) {
    console.error(`[claims] cannot read TREASURY_KEYPAIR: ${errorMessage(err)}`)
    return null
  }
}

/**
 * One transaction: create the claimer's ATA if missing (idempotent, paid by
 * the treasury) and transfer. Two separate transactions could leave the ATA
 * created but the transfer unsent.
 */
function buildTransferTransaction(params: {
  treasury: Keypair
  mint: PublicKey
  dest: PublicKey
  amount: number
  decimals: number
  blockhash: string
  lastValidBlockHeight: number
}): Transaction {
  const { treasury, mint, dest, amount, decimals, blockhash, lastValidBlockHeight } = params
  const source = getAssociatedTokenAddressSync(mint, treasury.publicKey, false, TOKEN_PROGRAM_ID)
  const destAta = getAssociatedTokenAddressSync(mint, dest, false, TOKEN_PROGRAM_ID)

  return new Transaction({ feePayer: treasury.publicKey, blockhash, lastValidBlockHeight }).add(
    createAssociatedTokenAccountIdempotentInstruction(treasury.publicKey, destAta, dest, mint, TOKEN_PROGRAM_ID),
    createTransferCheckedInstruction(source, mint, destAta, treasury.publicKey, amount, decimals, [], TOKEN_PROGRAM_ID),
  )
}

function failure(status: number, reason: string): ClaimFailure {
  return { ok: false, status, reason }
}

function parseSecretKey(raw: string): Keypair | null {
  const text = raw.trim()
  try {
    if (text.startsWith('[')) {
      return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(text) as number[]))
    }
    return Keypair.fromSecretKey(bs58.decode(text))
  } catch {
    return null
  }
}
