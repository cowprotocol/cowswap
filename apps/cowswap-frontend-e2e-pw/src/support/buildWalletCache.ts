import { spawn } from 'node:child_process'
import { cp, rm } from 'node:fs/promises'
import path from 'node:path'

import { DEFAULT_RPC_PROXY_PORT, RPC_PROXY_PORT_ENV, SEPOLIA_RPC_URL_ENV } from './constants'
import { createRpcProxy } from './rpcProxy'

/**
 * Builds the Synpress MetaMask cache (`.cache-synpress/<hash>`) consumed by the test fixtures.
 *
 * Two quirks this script papers over:
 *
 * 1. The `synpress` CLI replays `wallet.setup.ts` in a real browser: MetaMask validates every
 *    network's RPC URL via `eth_chainId` when it is added, so the RPC proxy must be running —
 *    on the SAME fixed port the tests will use, because the URLs are baked into the cached
 *    profile (the setup function does not re-run at test time).
 *
 * 2. The CLI names the cache dir after a hash of the setup function extracted from the raw
 *    TS source, while at test time Synpress hashes `fn.toString()` of the babel-transpiled
 *    function (imported identifiers become `_playwright.MetaMask` etc.) — the two hashes
 *    never agree for a non-trivial setup function. After the CLI finishes, we probe the
 *    runtime hash by running walletSetupHashProbe.spec.ts under Playwright's own transform
 *    and copy the cache dir to that name.
 *
 * Usage: tsx src/support/buildWalletCache.ts [--force] [--headless]
 */

interface RunResult {
  exitCode: number
  stdout: string
}

function run(command: string, args: string[], extraEnv: Record<string, string>): Promise<RunResult> {
  return new Promise<RunResult>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['inherit', 'pipe', 'inherit'],
      env: { ...process.env, ...extraEnv },
    })
    let stdout = ''
    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf8')
      process.stdout.write(chunk)
    })
    child.on('error', reject)
    child.on('close', (code) => resolve({ exitCode: code ?? 1, stdout }))
  })
}

async function main(): Promise<number> {
  const sepoliaRpcUrl = process.env[SEPOLIA_RPC_URL_ENV]
  if (!sepoliaRpcUrl) {
    throw new Error(`${SEPOLIA_RPC_URL_ENV} env var is required to build the wallet cache`)
  }

  const port = Number(process.env[RPC_PROXY_PORT_ENV] ?? DEFAULT_RPC_PROXY_PORT)
  const proxy = await createRpcProxy({ sepoliaRpcUrl, port })
  console.log(`RPC proxy listening on ${proxy.url} for the cache build`)

  let cliResult: RunResult
  try {
    cliResult = await run('pnpm', ['exec', 'synpress', 'src/support', ...process.argv.slice(2)], {
      [RPC_PROXY_PORT_ENV]: String(proxy.port),
    })
  } finally {
    await proxy.close()
  }
  if (cliResult.exitCode !== 0) return cliResult.exitCode

  const cliHash = cliResult.stdout.match(/Triggering cache creation for: ([0-9a-f]+)/)?.[1]
  if (!cliHash) {
    // Nothing was (re)built — cache already existed and --force was not passed. The runtime
    // alias from the previous build is still in place.
    console.log('Cache build skipped by the CLI; nothing to alias.')
    return 0
  }

  const probe = await run('pnpm', ['exec', 'playwright', 'test', '--config', 'src/support/hashProbe.config.ts'], {})
  if (probe.exitCode !== 0) return probe.exitCode
  const runtimeHash = probe.stdout.match(/WALLET_SETUP_HASH=([0-9a-f]+)/)?.[1]
  if (!runtimeHash) {
    throw new Error('Could not determine the runtime wallet-setup hash from the probe output')
  }

  if (runtimeHash === cliHash) {
    console.log(`Cache hash ${cliHash} matches at runtime; no alias needed.`)
    return 0
  }

  const cacheRoot = path.join(process.cwd(), '.cache-synpress')
  const aliasDir = path.join(cacheRoot, runtimeHash)
  await rm(aliasDir, { recursive: true, force: true })
  await cp(path.join(cacheRoot, cliHash), aliasDir, { recursive: true })
  console.log(`Aliased cache ${cliHash} -> ${runtimeHash} (hash Synpress computes at test runtime).`)
  return 0
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
