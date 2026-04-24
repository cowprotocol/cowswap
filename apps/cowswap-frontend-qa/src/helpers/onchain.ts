import { createPublicClient, erc20Abi, http, parseAbiItem, type Address, type Hex, type PublicClient } from 'viem'
import { mainnet } from 'viem/chains'

interface Erc20AllowanceParams {
  owner: Address
  rpcUrl: string
  spender: Address
  token: Address
}

interface Erc20ApprovalLogsParams extends Erc20AllowanceParams {
  fromBlock: bigint
}

interface Erc20ApprovalLogsForOwnerParams {
  fromBlock: bigint
  owner: Address
  rpcUrl: string
  token: Address
}

export interface Erc20ApprovalLog {
  blockNumber: bigint
  spender: Address
  transactionHash: Hex
  value: bigint
}

const ERC20_APPROVAL_EVENT = parseAbiItem(
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
)

function createAnvilClient(rpcUrl: string): PublicClient {
  return createPublicClient({
    chain: mainnet,
    transport: http(rpcUrl),
  })
}

export async function getCurrentBlockNumber(rpcUrl: string): Promise<bigint> {
  return createAnvilClient(rpcUrl).getBlockNumber()
}

export async function readErc20Allowance({ owner, rpcUrl, spender, token }: Erc20AllowanceParams): Promise<bigint> {
  return createAnvilClient(rpcUrl).readContract({
    address: token,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [owner, spender],
  })
}

export async function getErc20ApprovalLogsForOwner({
  fromBlock,
  owner,
  rpcUrl,
  token,
}: Erc20ApprovalLogsForOwnerParams): Promise<Erc20ApprovalLog[]> {
  const logs = await createAnvilClient(rpcUrl).getLogs({
    address: token,
    event: ERC20_APPROVAL_EVENT,
    args: { owner },
    fromBlock,
    toBlock: 'latest',
  })

  return logs.map((log) => {
    const blockNumber = log.blockNumber
    const spender = log.args.spender
    const transactionHash = log.transactionHash
    const value = log.args.value

    if (blockNumber === null || typeof spender !== 'string' || transactionHash === null || typeof value !== 'bigint') {
      throw new Error('Received incomplete ERC20 Approval log from Anvil')
    }

    return { blockNumber, spender, transactionHash, value }
  })
}

export async function getErc20ApprovalLogs({
  fromBlock,
  owner,
  rpcUrl,
  spender,
  token,
}: Erc20ApprovalLogsParams): Promise<Erc20ApprovalLog[]> {
  const logs = await createAnvilClient(rpcUrl).getLogs({
    address: token,
    event: ERC20_APPROVAL_EVENT,
    args: { owner, spender },
    fromBlock,
    toBlock: 'latest',
  })

  return logs.map((log) => {
    const blockNumber = log.blockNumber
    const transactionHash = log.transactionHash
    const value = log.args.value

    if (blockNumber === null || transactionHash === null || typeof value !== 'bigint') {
      throw new Error('Received incomplete ERC20 Approval log from Anvil')
    }

    return { blockNumber, spender, transactionHash, value }
  })
}
