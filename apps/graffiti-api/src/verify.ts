import {
  Connection,
  Keypair,
  PublicKey,
  TransactionResponse,
} from "@solana/web3.js";
import type { Config } from "./config.js";
import type { Store } from "./store.js";
import fs from "node:fs";
import bs58 from "bs58";

const TOKEN_PROGRAM = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const TOKEN_2022_PROGRAM = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
const MEMO_PROGRAMS = [
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr", // v2 (spl-memo)
  "Memo1UhkJRfHyvLMcVucJwxXeuD7MMEq7ddQNbvqF8Ff", // v1
];

export interface VerifyInput {
  txSignature: string | null;
  walletPubkey: string;
  costCells: number;
}

export type VerifyResult = { ok: true; burned: number } | { ok: false; reason: string };

interface ParsedIx {
  programId?: string | PublicKey;
  programIdIndex?: number;
  parsed?: { type?: string; info?: Record<string, unknown>; data?: unknown } | string;
  accountIndexes?: number[];
  /** partially-decoded instructions carry a base58 payload instead of `parsed` */
  data?: string;
}

/**
 * Verify a draw request against the burn tx on-chain (spec §Draw verification).
 * With DEV_INSECURE=1 on-chain verification is skipped (frontend e2e before
 * the mint exists) but signature/memo replay bookkeeping still applies.
 */
export class DrawVerifier {
  private connection: Connection | null = null;
  private mintKey: PublicKey | null = null;

  constructor(
    private readonly config: Config,
    private readonly store: Store
  ) {}

  private conn(): Connection {
    if (!this.connection) this.connection = new Connection(this.config.rpcUrl, "confirmed");
    return this.connection;
  }

  async verify(input: VerifyInput): Promise<VerifyResult> {
    const { txSignature, walletPubkey, costCells } = input;

    let wallet: PublicKey;
    try {
      wallet = new PublicKey(walletPubkey);
    } catch {
      return { ok: false, reason: "invalid walletPubkey" };
    }

    if (this.config.devInsecure) {
      // Dev mode: still record signature so replay semantics are exercised.
      if (txSignature) {
        if (this.store.hasSignature(txSignature)) return { ok: false, reason: "signature already used" };
        this.store.addSignature(txSignature);
      }
      return { ok: true, burned: costCells };
    }

    if (!this.config.mint) return { ok: false, reason: "server misconfigured: MINT not set" };
    if (!this.mintKey) this.mintKey = new PublicKey(this.config.mint);
    if (!txSignature) return { ok: false, reason: "txSignature required" };
    if (this.store.hasSignature(txSignature)) return { ok: false, reason: "signature already used" };

    const tx = (await this.conn().getParsedTransaction(txSignature, {
      maxSupportedTransactionVersion: 0,
    })) as TransactionResponse | null;
    if (!tx) return { ok: false, reason: "transaction not found (yet?)" };

    // status ok
    // NOTE: err === null means SUCCESS. The old `?? true` inverted this and
    // rejected every successful transaction.
    if (!tx.meta || tx.meta.err)
      return { ok: false, reason: `transaction failed: ${JSON.stringify(tx.meta?.err ?? "meta missing")}` };

    // recent
    const blockTime = tx.blockTime;
    if (typeof blockTime !== "number") return { ok: false, reason: "missing blockTime" };
    const age = Math.floor(Date.now() / 1000) - blockTime;
    if (age < -this.config.txMaxAgeSec || age > this.config.txMaxAgeSec)
      return { ok: false, reason: `transaction too old (${age}s)` };

    // Burn / BurnChecked on THE graffiti mint
    const instructions: ParsedIx[] = [];
    for (const ix of tx.transaction.message.instructions) instructions.push(ix as unknown as ParsedIx);
    for (const inner of tx.meta?.innerInstructions ?? [])
      for (const ix of inner.instructions) instructions.push(ix as unknown as ParsedIx);

    let burned = 0;
    const ownerConfirmed = { value: false };
    for (const ix of instructions) {
      const parsed = ix.parsed;
      if (!parsed || typeof parsed === "string") continue;
      if (parsed.type !== "burn" && parsed.type !== "burnChecked") continue;
      // NOTE: web3.js v1 parsed transactions expose programId as a PublicKey
      // INSTANCE, not a string — normalize before comparing.
      const rawPid: unknown = ix.programId;
      const pid =
        typeof rawPid === "string"
          ? rawPid
          : rawPid instanceof PublicKey
            ? rawPid.toBase58()
            : programIdFromIndex(tx, ix.programIdIndex);
      if (pid !== TOKEN_PROGRAM.toBase58() && pid !== TOKEN_2022_PROGRAM.toBase58()) continue;
      const info = parsed.info ?? {};
      if (info.mint !== this.config.mint) continue;
      // jsonParsed: `burn` carries info.amount; `burnChecked` carries
      // info.tokenAmount.amount (string).
      const amtRaw =
        (info as { tokenAmount?: { amount?: string | number } }).tokenAmount?.amount ?? info.amount ?? 0;
      burned += Number(amtRaw);
      if (!ownerConfirmed.value && this.burnerMatches(tx, ix, info, wallet)) ownerConfirmed.value = true;
    }
    if (burned < costCells)
      return { ok: false, reason: `burn amount ${burned} < cost ${costCells}` };
    if (!ownerConfirmed.value)
      return { ok: false, reason: "burner does not match walletPubkey" };

    // memo: graffiti:v1:<pubkey>:<ts>, unique per pubkey within the window
    const memo = findMemo(tx, wallet.toBase58());
    if ("err" in memo) return { ok: false, reason: memo.err };
    if (this.store.hasMemo(memo.memo)) return { ok: false, reason: "memo already used (replay)" };

    // record before applying
    this.store.addSignature(txSignature);
    this.store.addMemo(memo.memo);
    return { ok: true, burned };
  }

  private burnerMatches(
    tx: TransactionResponse,
    ix: ParsedIx,
    info: Record<string, unknown>,
    wallet: PublicKey
  ): boolean {
    // Fast path: burn authority (owner or delegate) is the claimed wallet.
    const authority = info.authority;
    if (typeof authority === "string" && authority === wallet.toBase58()) return true;

    // Robust path: owner of the source token account via pre-token-balances.
    const source = typeof info.account === "string" ? info.account : null;
    if (!source) return false;
    const ownerByIndex = new Map<number, string>();
    for (const tb of tx.meta?.preTokenBalances ?? []) {
      if (tb.mint === this.config.mint && tb.owner) ownerByIndex.set(tb.accountIndex, tb.owner);
    }
    if (ix.accountIndexes) {
      for (const idx of ix.accountIndexes) {
        if (ownerByIndex.get(idx) === wallet.toBase58()) return true;
      }
    }
    // accountIndexes unavailable (older RPC): match by account position is not
    // reliable, so fall back to authority-only confirmation (already checked).
    return false;
  }
}

function programIdFromIndex(tx: TransactionResponse, index: number | undefined): string | undefined {
  if (index === undefined) return undefined;
  const keys = (tx.transaction.message as unknown as { accountKeys: Array<{ pubkey: string }> }).accountKeys;
  return keys[index]?.pubkey;
}

type MemoResult = { memo: string } | { err: string };

function findMemo(tx: TransactionResponse, walletB58: string): MemoResult {
  const expected = new RegExp(`^graffiti:v1:${walletB58}:(\\d{10,13})$`);
  let found: { memo: string; ts: number } | null = null;
  const instructions: ParsedIx[] = [];
  for (const ix of tx.transaction.message.instructions) instructions.push(ix as unknown as ParsedIx);
  for (const inner of tx.meta?.innerInstructions ?? [])
    for (const ix of inner.instructions) instructions.push(ix as unknown as ParsedIx);
  for (const ix of instructions) {
    const rawPid2: unknown = ix.programId;
    const pid2 =
      typeof rawPid2 === "string" ? rawPid2 : rawPid2 instanceof PublicKey ? rawPid2.toBase58() : programIdFromIndex(tx, ix.programIdIndex);
    if (!pid2 || !MEMO_PROGRAMS.includes(pid2)) continue;
    // fully-parsed memos carry parsed.data; partially-decoded ones carry a
    // base58 `data` payload — accept both.
    // spl-memo parses to a PLAIN STRING (parsed: "graffiti:v1:…"), other
    // programs to { type, info } objects.
    let text: string | null = typeof ix.parsed === "string" ? ix.parsed.trim() : null;
    if (!text) {
      const pData = (ix.parsed as { data?: unknown } | undefined)?.data;
      if (typeof pData === "string") text = pData.trim();
    }
    if (!text && typeof ix.data === "string") {
      try {
        const dec = (bs58 as unknown as { decode: (s: string) => Uint8Array }).decode;
        text = Buffer.from(dec(ix.data)).toString("utf8").trim();
      } catch {
        text = null;
      }
    }
    if (!text) continue;
    const m = expected.exec(text);
    if (m) found = { memo: text, ts: Number(m[1]) };
  }
  if (!found) return { err: "missing/invalid memo (expected graffiti:v1:<pubkey>:<ts>)" };
  // memo ts must sit within the freshness window (replay protection per spec)
  const now = Date.now();
  const tsMs = found.ts < 1e12 ? found.ts * 1000 : found.ts; // seconds or ms
  if (Math.abs(now - tsMs) > 90_000) return { err: "memo ts outside freshness window" };
  return { memo: found.memo };
}

/** Load the treasury keypair (claims payer) from disk, if configured. */
export function loadTreasury(pathStr: string): Keypair | null {
  try {
    const secret = JSON.parse(fs.readFileSync(pathStr, "utf8")) as number[];
    return Keypair.fromSecretKey(Uint8Array.from(secret));
  } catch {
    return null;
  }
}
