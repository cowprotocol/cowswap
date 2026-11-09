import path from "node:path";
import { fileURLToPath } from "node:url";

export interface Config {
  port: number;
  rpcUrl: string;
  network: string;
  mint: string | null;
  treasuryKeypairPath: string | null;
  dbPath: string;
  devInsecure: boolean;
  adminToken: string | null;
  /** Max age (seconds) of an accepted draw tx. */
  txMaxAgeSec: number;
  /** Max cells accepted in a single draw request. */
  maxCellsPerDraw: number;
}

const thisDir = path.dirname(fileURLToPath(import.meta.url));

/** Package root (apps/graffiti-api), works both under tsx (src/) and compiled (dist/src/). */
export const PKG_ROOT = thisDir.includes(path.join("dist", "src"))
  ? path.resolve(thisDir, "..", "..")
  : path.resolve(thisDir, "..");

function num(name: string, def: number): number {
  const v = process.env[name];
  if (v === undefined || v === "") return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export function loadConfig(): Config {
  return {
    port: num("PORT", 3000),
    rpcUrl: process.env.RPC_URL ?? "https://api.devnet.solana.com",
    network: process.env.NETWORK ?? "devnet",
    mint: process.env.MINT ?? null,
    treasuryKeypairPath: process.env.TREASURY_KEYPAIR ?? null,
    dbPath: process.env.GRAFFITI_DB ?? path.resolve(PKG_ROOT, "data", "graffiti.db"),
    devInsecure: process.env.DEV_INSECURE === "1",
    adminToken: process.env.ADMIN_TOKEN ?? null,
    txMaxAgeSec: num("TX_MAX_AGE_SEC", 90),
    maxCellsPerDraw: num("MAX_CELLS_PER_DRAW", 20000),
  };
}

// GRAFFITI FORK: rectangular wall (landscape — iPads/laptops).
// All geometry is ENV-parametrizable so a new canvas is a config change, not a
// code change: CANVAS_WIDTH / CANVAS_HEIGHT / MAX_BOX_WIDTH / MAX_BOX_HEIGHT.
export const CANVAS_WIDTH = num("CANVAS_WIDTH", 4096);
export const CANVAS_HEIGHT = num("CANVAS_HEIGHT", 2048);
/** Max bounding box a single commit may cover, so nobody paints a whole-wall banner. */
export const MAX_BOX_WIDTH = num("MAX_BOX_WIDTH", 256);
export const MAX_BOX_HEIGHT = num("MAX_BOX_HEIGHT", 128);

/** Claims default amount when generating codes without an explicit amount. */
export const DEFAULT_CLAIM_AMOUNT = 1000;
/** Initial supply minted to the treasury by scripts/create-mint.ts. */
export const INITIAL_SUPPLY = 1_000_000;
