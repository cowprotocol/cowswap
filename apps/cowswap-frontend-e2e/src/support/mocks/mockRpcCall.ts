/**
 * Intercepts JSON-RPC HTTP requests via cy.intercept to mock responses at
 * the network level.
 *
 * Uses a single intercept per test with a registry of patches.
 * Call setupRpcMocks() inside an it() block, register patches, then cy.visit().
 */

import { decodeFunctionData, decodeFunctionResult, encodeFunctionResult, type Hex, parseAbiItem, toHex } from 'viem'

const AGGREGATE3_ABI = [
  parseAbiItem(
    'function aggregate3((address target, bool allowFailure, bytes callData)[] calls) returns ((bool success, bytes returnData)[])',
  ),
]
const GET_ETH_BALANCE_ABI = [parseAbiItem('function getEthBalance(address addr) view returns (uint256 balance)')]

const MULTICALL3_ADDRESS = '0xca11bde05977b3631167028862be2a173976ca11'
const RPC_URL_PATTERN = /infura\.io|1rpc\.io|alchemy\.com|publicnode\.com|sepolia/

// --- Patch types ---

interface NativeBalancePatch {
  type: 'nativeBalance'
  owner: string
  value: bigint
}

type RpcPatch = NativeBalancePatch | TokenCallPatch

interface TokenCallPatch {
  type: 'tokenCall'
  tokenAddress: string
  selector: string
  value: bigint
}

// --- Multicall patching helpers ---

export function mockNativeBalanceHttp(owner: string, value: bigint): void {
  setupRpcMocks().mockNativeBalance(owner, value)
}

/**
 * Sets up RPC mocks for a single test. Call inside an it() block before cy.visit().
 */
export function setupRpcMocks(): {
  mockNativeBalance(owner: string, value: bigint): void
  mockTokenBalance(tokenAddress: string, value: bigint): void
  mockTokenAllowance(tokenAddress: string, value: bigint): void
} {
  const patches: RpcPatch[] = []

  cy.intercept('POST', RPC_URL_PATTERN, (req) => handleRpcRequest(req, patches))

  return {
    mockNativeBalance(owner, value) {
      patches.push({ type: 'nativeBalance', owner, value })
    },
    mockTokenBalance(tokenAddress, value) {
      patches.push({ type: 'tokenCall', tokenAddress, selector: '0x70a08231', value })
    },
    mockTokenAllowance(tokenAddress, value) {
      patches.push({ type: 'tokenCall', tokenAddress, selector: '0xdd62ed3e', value })
    },
  }
}

function buildPatchMap(
  calls: ReadonlyArray<{ target: string; allowFailure: boolean; callData: string }>,
  patches: RpcPatch[],
): Map<number, Hex> {
  const patchMap = new Map<number, Hex>()

  for (let i = 0; i < calls.length; i++) {
    const call = calls[i]
    matchNativeBalance(call, patches, i, patchMap)
    matchTokenCalls(call, patches, i, patchMap)
  }

  return patchMap
}

// eslint-disable-next-line complexity
function handleRpcRequest(req: Cypress.Request, patches: RpcPatch[]): void {
  const body = req.body as { method?: string; params?: unknown[]; id?: number }
  if (!body?.method || patches.length === 0) {
    req.continue()
    return
  }

  // Direct eth_getBalance
  if (body.method === 'eth_getBalance') {
    const params = body.params as string[]
    const patch = patches.find(
      (p) => p.type === 'nativeBalance' && p.owner.toLowerCase() === params?.[0]?.toLowerCase(),
    )
    if (patch) {
      req.reply({
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: { jsonrpc: '2.0', id: body.id ?? 1, result: toHex(patch.value) },
      })
      return
    }
  }

  // Multicall3 aggregate3
  if (body.method === 'eth_call') {
    const callObj = body.params?.[0] as { to?: string; data?: string } | undefined
    if (callObj?.to?.toLowerCase() === MULTICALL3_ADDRESS && callObj?.data?.startsWith('0x82ad56cb')) {
      try {
        const decoded = decodeFunctionData({ abi: AGGREGATE3_ABI, data: callObj.data as Hex })
        const calls = decoded.args[0] as Array<{ target: string; allowFailure: boolean; callData: string }>
        const patchMap = buildPatchMap(calls, patches)

        if (patchMap.size > 0) {
          req.continue((res) => {
            try {
              patchMulticallResponse(res, patchMap)
            } catch {
              /* let original through */
            }
          })
          return
        }
      } catch {
        /* decode failed */
      }
    }
  }

  req.continue()
}

// --- Intercept handler ---

function matchNativeBalance(
  call: { target: string; callData: string },
  patches: RpcPatch[],
  index: number,
  patchMap: Map<number, Hex>,
): void {
  if (call.target.toLowerCase() !== MULTICALL3_ADDRESS || !call.callData.startsWith('0x4d2301cc')) return
  try {
    const { args } = decodeFunctionData({ abi: GET_ETH_BALANCE_ABI, data: call.callData as Hex })
    const patch = patches.find((p) => p.type === 'nativeBalance' && p.owner.toLowerCase() === args[0].toLowerCase())
    if (patch) {
      patchMap.set(
        index,
        encodeFunctionResult({ abi: GET_ETH_BALANCE_ABI, functionName: 'getEthBalance', result: patch.value }) as Hex,
      )
    }
  } catch {
    /* skip */
  }
}

// --- Public API ---

function matchTokenCalls(
  call: { target: string; callData: string },
  patches: RpcPatch[],
  index: number,
  patchMap: Map<number, Hex>,
): void {
  for (const patch of patches) {
    if (
      patch.type === 'tokenCall' &&
      call.target.toLowerCase() === patch.tokenAddress.toLowerCase() &&
      call.callData.startsWith(patch.selector)
    ) {
      patchMap.set(index, toHex(patch.value, { size: 32 }) as Hex)
    }
  }
}

function patchMulticallResponse(res: Cypress.Response<unknown>, patchMap: Map<number, Hex>): void {
  const resBody = typeof res.body === 'string' ? JSON.parse(res.body) : res.body
  const results = decodeFunctionResult({
    abi: AGGREGATE3_ABI,
    functionName: 'aggregate3',
    data: resBody.result as Hex,
  }) as Array<{ success: boolean; returnData: Hex }>

  const patched = results.map((item, idx) => {
    const data = patchMap.get(idx)
    return data ? { success: true, returnData: data } : item
  })

  resBody.result = encodeFunctionResult({ abi: AGGREGATE3_ABI, functionName: 'aggregate3', result: patched })
  res.body = resBody
}
