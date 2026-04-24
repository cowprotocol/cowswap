import {
  createPublicClient,
  encodeFunctionData,
  erc20Abi,
  formatEther,
  http,
  type Address,
  type Hex,
  toHex,
} from 'viem'
import { mainnet } from 'viem/chains'

import { spawn, type ChildProcessByStdio } from 'node:child_process'
import { once } from 'node:events'

import { MAINNET_COW_VAULT_RELAYER, MAINNET_WETH } from '../helpers/tokens'

import type { Readable } from 'node:stream'

const ANVIL_HOST = '127.0.0.1'
const ANVIL_PORT = 8545
const ANVIL_CHAIN_ID = '0x1'
const DEFAULT_FORK_BLOCK = '21000000'
const START_TIMEOUT_MS = 30_000
const STOP_TIMEOUT_MS = 5_000

type AnvilProcess = ChildProcessByStdio<null, Readable, Readable>
type AnvilPublicClient = ReturnType<typeof createPublicClient>

interface JsonRpcResponse<Result> {
  error?: {
    code: number
    message: string
  }
  result?: Result
}

type SnapshotId = string

const wethAbi = [
  {
    inputs: [],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const

export interface AnvilInstance {
  dispose: () => Promise<void>
  url: string
}

interface WrapEthToWethParams {
  owner: Address
  rpcUrl: string
  amount: bigint
}

interface ApproveWethParams {
  amount: bigint
  owner: Address
  rpcUrl: string
}

function logLocal(message: string): void {
  if (!process.env.CI) {
    process.stderr.write(`[cowswap-frontend-qa] ${message}\n`)
  }
}

function getMainnetRpc(): string {
  const mainnetRpc = process.env.MAINNET_RPC
  if (!mainnetRpc) {
    throw new Error('MAINNET_RPC env missing')
  }

  return mainnetRpc
}

function getForkBlock(): string {
  return process.env.FORK_BLOCK ?? DEFAULT_FORK_BLOCK
}

function buildRpcUrl(): string {
  return `http://${ANVIL_HOST}:${ANVIL_PORT}`
}

function collectSecretsToRedact(mainnetRpc: string): string[] {
  const secrets = new Set<string>([mainnetRpc])

  try {
    const parsedUrl = new URL(mainnetRpc)

    if (parsedUrl.username) {
      secrets.add(parsedUrl.username)
    }

    if (parsedUrl.password) {
      secrets.add(parsedUrl.password)
    }

    const lastPathSegment = parsedUrl.pathname.split('/').filter(Boolean).at(-1)
    if (lastPathSegment && lastPathSegment.length >= 8) {
      secrets.add(lastPathSegment)
    }

    for (const value of parsedUrl.searchParams.values()) {
      if (value.length >= 8) {
        secrets.add(value)
      }
    }
  } catch {
    // Keep the raw env value in the redact list even when URL parsing fails.
  }

  return Array.from(secrets).sort((left, right) => right.length - left.length)
}

function redactSecrets(value: string, secretsToRedact: string[]): string {
  return secretsToRedact.reduce((result, secret) => {
    return secret ? result.split(secret).join('[REDACTED]') : result
  }, value)
}

function formatBufferedOutput(outputBuffer: string[]): string {
  const output = outputBuffer.join('').trim()

  return output ? `\nRecent anvil output:\n${output}` : ''
}

function delay(timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, timeoutMs)
  })
}

function getTransactionHash(result: unknown): Hex {
  if (typeof result === 'string' && result.startsWith('0x')) {
    return result as Hex
  }

  throw new Error(`Expected a transaction hash from Anvil, received ${String(result)}`)
}

function createRpcClient(rpcUrl: string): AnvilPublicClient {
  return createPublicClient({
    chain: mainnet,
    transport: http(rpcUrl),
  })
}

async function waitForAnvil(url: string): Promise<void> {
  const deadline = Date.now() + START_TIMEOUT_MS

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: 'eth_chainId',
          params: [],
        }),
      })

      if (response.ok) {
        const body = (await response.json()) as JsonRpcResponse<string>
        if (body.result === ANVIL_CHAIN_ID) {
          return
        }
      }
    } catch {
      // Anvil is still booting.
    }

    await delay(500)
  }

  throw new Error(`Timed out waiting for Anvil at ${url}`)
}

async function stopAnvilProcess(process: AnvilProcess): Promise<void> {
  if (process.exitCode !== null) return

  process.kill('SIGTERM')

  const exited = await Promise.race([once(process, 'exit').then(() => true), delay(STOP_TIMEOUT_MS).then(() => false)])

  if (exited) return

  process.kill('SIGKILL')
  await once(process, 'exit')
}

export async function wrapEthToWeth({ owner, rpcUrl, amount }: WrapEthToWethParams): Promise<void> {
  const publicClient = createRpcClient(rpcUrl)

  logLocal(`Wrapping ${formatEther(amount)} ETH into WETH for ${owner}`)

  const hash = getTransactionHash(
    await publicClient.request({
      method: 'eth_sendTransaction' as never,
      params: [
        {
          from: owner,
          to: MAINNET_WETH,
          value: toHex(amount),
          data: encodeFunctionData({
            abi: wethAbi,
            functionName: 'deposit',
          }),
        },
      ] as never,
    }),
  )

  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  if (receipt.status !== 'success') {
    throw new Error(`WETH deposit transaction failed for ${owner}`)
  }

  const wrappedBalance = await publicClient.readContract({
    address: MAINNET_WETH,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [owner],
  })

  if (wrappedBalance < amount) {
    throw new Error(
      `Expected wrapped WETH balance to be at least ${amount.toString()}, received ${wrappedBalance.toString()}`,
    )
  }
}

export async function approveWethForCowVaultRelayer({ owner, rpcUrl, amount }: ApproveWethParams): Promise<void> {
  const publicClient = createRpcClient(rpcUrl)

  const hash = getTransactionHash(
    await publicClient.request({
      method: 'eth_sendTransaction' as never,
      params: [
        {
          from: owner,
          to: MAINNET_WETH,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [MAINNET_COW_VAULT_RELAYER, amount],
          }),
        },
      ] as never,
    }),
  )

  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  if (receipt.status !== 'success') {
    throw new Error(`WETH approval transaction failed for ${owner}`)
  }

  const allowance = await publicClient.readContract({
    address: MAINNET_WETH,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [owner, MAINNET_COW_VAULT_RELAYER],
  })

  if (allowance < amount) {
    throw new Error(`Expected WETH allowance to be at least ${amount.toString()}, received ${allowance.toString()}`)
  }
}

export async function createAnvilSnapshot(rpcUrl: string): Promise<SnapshotId> {
  const publicClient = createRpcClient(rpcUrl)
  const snapshotId = await publicClient.request({
    method: 'evm_snapshot' as never,
    params: [] as never,
  })

  if (typeof snapshotId !== 'string' || !snapshotId) {
    throw new Error(`Expected Anvil snapshot id to be a string, received ${String(snapshotId)}`)
  }

  return snapshotId
}

export async function revertAnvilSnapshot(rpcUrl: string, snapshotId: SnapshotId): Promise<void> {
  const publicClient = createRpcClient(rpcUrl)
  const reverted = await publicClient.request({
    method: 'evm_revert' as never,
    params: [snapshotId] as never,
  })

  if (reverted !== true) {
    throw new Error(`Failed to revert Anvil snapshot ${snapshotId}`)
  }
}

export async function startAnvil(): Promise<AnvilInstance> {
  const url = buildRpcUrl()
  const mainnetRpc = getMainnetRpc()
  const secretsToRedact = collectSecretsToRedact(mainnetRpc)
  const outputBuffer: string[] = []
  const forkBlock = getForkBlock()

  logLocal(`Starting Anvil mainnet fork on ${url} at block ${forkBlock}`)

  const process = spawn(
    'anvil',
    [
      '--fork-url',
      mainnetRpc,
      '--fork-block-number',
      forkBlock,
      '--chain-id',
      '1',
      '--host',
      ANVIL_HOST,
      '--port',
      String(ANVIL_PORT),
      '--accounts',
      '3',
      '--balance',
      '10000',
      '--order',
      'fifo',
    ],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )

  const captureOutput = (chunk: Buffer): void => {
    outputBuffer.push(redactSecrets(chunk.toString(), secretsToRedact))
    if (outputBuffer.length > 20) {
      outputBuffer.shift()
    }
  }

  process.stdout.on('data', captureOutput)
  process.stderr.on('data', captureOutput)

  let started = false

  const earlyExit = new Promise<never>((_, reject) => {
    process.once('error', (error) => {
      reject(new Error(redactSecrets(`Failed to spawn anvil: ${error.message}`, secretsToRedact)))
    })
    process.once('exit', (code, signal) => {
      if (!started) {
        reject(
          new Error(
            `Anvil exited before becoming ready (code=${String(code)}, signal=${String(signal)})\n${outputBuffer.join('')}`,
          ),
        )
      }
    })
  })

  try {
    await Promise.race([waitForAnvil(url), earlyExit])
    started = true
    logLocal(`Anvil is ready on ${url}`)
  } catch (error) {
    await stopAnvilProcess(process)

    const reason = redactSecrets(error instanceof Error ? error.message : String(error), secretsToRedact)
    throw new Error(`${reason}${formatBufferedOutput(outputBuffer)}`)
  }

  return {
    url,
    dispose: async () => {
      logLocal('Stopping Anvil')
      await stopAnvilProcess(process)
    },
  }
}
