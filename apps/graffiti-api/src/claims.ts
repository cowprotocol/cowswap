import {
  getOrCreateAssociatedTokenAccount,
  getAssociatedTokenAddressSync,
  transfer as splTransfer,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import fs from "node:fs";
import type { Config } from "./config.js";
import { DEFAULT_CLAIM_AMOUNT } from "./config.js";
import type { Store } from "./store.js";

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/** Random 22-char base58 claim code. */
export function generateClaimCode(): string {
  let code = "";
  for (let i = 0; i < 22; i++) code += BASE58_ALPHABET[Math.floor(Math.random() * BASE58_ALPHABET.length)];
  return code;
}

export type ClaimResult =
  | { ok: true; txSignature: string; amount: number }
  | { ok: false; status: number; reason: string };

/**
 * Claim codes + on-chain transfer from the treasury ATA to the claimer
 * (spec §Claim flow). Codes are single-use; the transfer is paid and signed
 * by the treasury keypair (TREASURY_KEYPAIR).
 */
export class ClaimService {
  private connection: Connection | null = null;
  private treasuryKeypair: Keypair | null | undefined;

  constructor(
    private readonly config: Config,
    private readonly store: Store
  ) {}

  private conn(): Connection {
    if (!this.connection) this.connection = new Connection(this.config.rpcUrl, "confirmed");
    return this.connection;
  }

  private treasury(): Keypair | null {
    if (this.treasuryKeypair === undefined) {
      this.treasuryKeypair = this.config.treasuryKeypairPath
        ? loadKeypair(this.config.treasuryKeypairPath)
        : null;
    }
    return this.treasuryKeypair;
  }

  treasuryPubkey(): string | null {
    return this.treasury()?.publicKey.toBase58() ?? null;
  }

  /** GET /claim/:code → {valid, amount} without revealing more. */
  check(code: string): { valid: boolean; amount: number } {
    const row = this.store.getClaim(code);
    if (!row || row.usedAt !== null) return { valid: false, amount: 0 };
    return { valid: true, amount: row.amount };
  }

  /** Generate n codes (admin/ops). Returns the created codes. */
  generate(n: number, amount: number = DEFAULT_CLAIM_AMOUNT): string[] {
    const codes: string[] = [];
    for (let i = 0; i < n; i++) {
      const code = generateClaimCode();
      this.store.insertClaim(code, amount);
      codes.push(code);
    }
    return codes;
  }

  /** POST /claim {code, walletPubkey} — transfer from treasury, mark used. */
  async claim(code: string, walletPubkey: string): Promise<ClaimResult> {
    const row = this.store.getClaim(code);
    if (!row) return { ok: false, status: 404, reason: "unknown claim code" };
    if (row.usedAt !== null) return { ok: false, status: 400, reason: "claim code already used" };

    let dest: PublicKey;
    try {
      dest = new PublicKey(walletPubkey);
    } catch {
      return { ok: false, status: 400, reason: "invalid walletPubkey" };
    }

    // Reserve the code atomically before the (slow) on-chain work so two
    // concurrent claims cannot both succeed.
    if (!this.store.markClaimUsed(code)) {
      return { ok: false, status: 400, reason: "claim code already used" };
    }

    if (this.config.devInsecure) {
      return { ok: true, txSignature: `dev-insecure-${code}`, amount: row.amount };
    }

    if (!this.config.mint) return { ok: false, status: 500, reason: "server misconfigured: MINT not set" };
    const treasury = this.treasury();
    if (!treasury)
      return { ok: false, status: 500, reason: "server misconfigured: TREASURY_KEYPAIR not set" };

    try {
      const conn = this.conn();
      const mint = new PublicKey(this.config.mint);
      const source = getAssociatedTokenAddressSync(mint, treasury.publicKey, false, TOKEN_PROGRAM_ID);
      // Create the claimer's ATA if needed (paid by treasury).
      const destAta = await getOrCreateAssociatedTokenAccount(
        conn,
        treasury,
        mint,
        dest,
        false,
        undefined,
        undefined,
        TOKEN_PROGRAM_ID
      );
      const sig = await splTransfer(
        conn,
        treasury,
        source,
        destAta.address,
        treasury,
        row.amount,
        [],
        undefined,
        TOKEN_PROGRAM_ID
      );
      return { ok: true, txSignature: sig, amount: row.amount };
    } catch (err) {
      // Transfer failed: free the code so the user can retry.
      this.store.insertClaim(code, row.amount);
      return { ok: false, status: 502, reason: `claim transfer failed: ${(err as Error).message}` };
    }
  }
}

function loadKeypair(p: string): Keypair | null {
  try {
    const secret = JSON.parse(fs.readFileSync(p, "utf8")) as number[];
    return Keypair.fromSecretKey(Uint8Array.from(secret));
  } catch {
    return null;
  }
}
