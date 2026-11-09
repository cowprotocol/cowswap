/**
 * Devnet token setup for the Graffiti Wall (spec §Token ops).
 *
 * Creates:
 *   - a new SPL mint (decimals: 0)
 *   - treasury keypair + its ATA
 *   - initial supply of 1_000_000 tokens minted to the treasury
 *
 * Keypairs are written to apps/graffiti-api/.keys/ (gitignored).
 * Prints MINT and TREASURY pubkeys for the server env (MINT / TREASURY_KEYPAIR).
 *
 * Usage: npm run mint:create [-- --rpc https://api.devnet.solana.com]
 */
import fs from "node:fs";
import path from "node:path";
import { Connection, Keypair, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { INITIAL_SUPPLY, PKG_ROOT } from "../src/config.js";

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const rpcIdx = args.indexOf("--rpc");
  const rpcUrl =
    rpcIdx !== -1 && args[rpcIdx + 1]
      ? args[rpcIdx + 1]
      : process.env.RPC_URL ?? clusterApiUrl("devnet");
  const keysDir = path.resolve(PKG_ROOT, ".keys");
  fs.mkdirSync(keysDir, { recursive: true });

  const connection = new Connection(rpcUrl, "confirmed");
  console.log(`[mint] RPC: ${rpcUrl}`);

  // Reuse existing keypairs so the script can be re-run after a manual funding.
  const loadOrGenerate = (name: string): Keypair => {
    const p = path.join(keysDir, name);
    if (fs.existsSync(p)) {
      const kp = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(p, "utf8")) as number[]));
      console.log(`[mint] reusing existing ${name}: ${kp.publicKey.toBase58()}`);
      return kp;
    }
    return Keypair.generate();
  };

  // TREASURY_KEYPAIR may point to an existing (possibly pre-funded) keypair.
  const treasuryEnvPath = process.env.TREASURY_KEYPAIR;
  let treasury: Keypair;
  if (treasuryEnvPath && fs.existsSync(treasuryEnvPath)) {
    treasury = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(fs.readFileSync(treasuryEnvPath, "utf8")) as number[])
    );
    console.log(`[mint] using TREASURY_KEYPAIR: ${treasury.publicKey.toBase58()}`);
  } else {
    treasury = loadOrGenerate("treasury.json");
  }
  const mint = loadOrGenerate("mint.json");

  // Fund the treasury so it can pay for account creation + minting.
  const balance = await connection.getBalance(treasury.publicKey);
  if (balance < LAMPORTS_PER_SOL) {
    console.log(
      `[mint] Requesting 2 SOL devnet airdrop for treasury ${treasury.publicKey.toBase58()} ...`
    );
    try {
      const sig = await connection.requestAirdrop(treasury.publicKey, 2 * LAMPORTS_PER_SOL);
      const latest = await connection.getLatestBlockhash();
      await connection.confirmTransaction({ signature: sig, ...latest }, "confirmed");
    } catch (err) {
      // The public devnet RPC faucet is closed (410) since late 2025; the web
      // faucet at https://faucet.solana.com requires a captcha. Tell the
      // operator to fund the treasury manually and re-run.
      console.error(`\n[mint] airdrop failed: ${(err as Error).message}`);
      console.error(`[mint] Fund this treasury address with devnet SOL manually:`);
      console.error(`        ${treasury.publicKey.toBase58()}`);
      console.error(`      (https://faucet.solana.com — captcha, one-time) then re-run:`);
      console.error(`        TREASURY_KEYPAIR=${path.join(keysDir, "treasury.json")} npm run mint:create`);
      fs.writeFileSync(path.join(keysDir, "treasury.json"), JSON.stringify(Array.from(treasury.secretKey)));
      fs.writeFileSync(path.join(keysDir, "mint.json"), JSON.stringify(Array.from(mint.secretKey)));
      process.exit(1);
    }
  }

  console.log("[mint] Creating mint (decimals: 0) ...");
  const mintPubkey = await createMint(
    connection,
    treasury, // payer
    treasury.publicKey, // mint authority
    null, // freeze authority
    0, // decimals
    mint,
    undefined,
    TOKEN_PROGRAM_ID
  );

  console.log("[mint] Creating treasury ATA ...");
  const treasuryAta = await getOrCreateAssociatedTokenAccount(
    connection,
    treasury,
    mintPubkey,
    treasury.publicKey,
    false,
    undefined,
    undefined,
    TOKEN_PROGRAM_ID
  );

  console.log(`[mint] Minting initial supply (${INITIAL_SUPPLY.toLocaleString()} units) ...`);
  await mintTo(
    connection,
    treasury,
    mintPubkey,
    treasuryAta.address,
    treasury,
    INITIAL_SUPPLY,
    [],
    undefined,
    TOKEN_PROGRAM_ID
  );

  fs.writeFileSync(path.join(keysDir, "mint.json"), JSON.stringify(Array.from(mint.secretKey)));
  fs.writeFileSync(path.join(keysDir, "treasury.json"), JSON.stringify(Array.from(treasury.secretKey)));

  console.log("");
  console.log("=========================================");
  console.log(`MINT     = ${mintPubkey.toBase58()}`);
  console.log(`TREASURY = ${treasury.publicKey.toBase58()}`);
  console.log("=========================================");
  console.log("Keypairs saved to .keys/mint.json and .keys/treasury.json (gitignored).");
  console.log("Run the API with:");
  console.log(`  MINT=${mintPubkey.toBase58()} TREASURY_KEYPAIR=${path.join(keysDir, "treasury.json")} npm run dev`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
