import { expect, type TestInfo } from '@playwright/test'
import { formatUnits, parseEther, type Address } from 'viem'

import {
  getCurrentBlockNumber,
  getErc20ApprovalLogsForOwner,
  readErc20Allowance,
  type Erc20ApprovalLog,
} from './onchain'
import { MAINNET_CHAIN_ID, MAINNET_WETH } from './tokens'

const APPROVAL_SELL_AMOUNT = parseEther('1')

interface WethApprovalProofParams {
  anvilUrl: string
  owner: Address
}

interface AssertWethApprovalProofParams extends WethApprovalProofParams {
  baseline: WethApprovalProofBaseline
  testInfo: TestInfo
}

export interface WethApprovalProofBaseline {
  fromBlock: bigint
  initialAllowance: bigint
}

function formatWethAmount(value: bigint): string {
  return `${formatUnits(value, 18)} WETH`
}

function getLatestSufficientApprovalLog(logs: Erc20ApprovalLog[]): Erc20ApprovalLog | undefined {
  for (let index = logs.length - 1; index >= 0; index -= 1) {
    const log = logs[index]

    if (log.value >= APPROVAL_SELL_AMOUNT) {
      return log
    }
  }

  return undefined
}

export async function createWethApprovalProofBaseline({
  anvilUrl,
  owner,
}: WethApprovalProofParams): Promise<WethApprovalProofBaseline> {
  const fromBlock = await getCurrentBlockNumber(anvilUrl)

  const existingApprovalLogs = await getErc20ApprovalLogsForOwner({
    fromBlock,
    owner,
    rpcUrl: anvilUrl,
    token: MAINNET_WETH,
  })

  expect(existingApprovalLogs).toHaveLength(0)

  return { fromBlock, initialAllowance: 0n }
}

export async function assertWethApprovalProof({
  anvilUrl,
  baseline,
  owner,
  testInfo,
}: AssertWethApprovalProofParams): Promise<void> {
  await expect
    .poll(
      async () => {
        const approvalLogs = await getErc20ApprovalLogsForOwner({
          fromBlock: baseline.fromBlock,
          owner,
          rpcUrl: anvilUrl,
          token: MAINNET_WETH,
        })

        return approvalLogs.some((log) => log.value >= APPROVAL_SELL_AMOUNT)
      },
      { message: 'Expected a WETH Approval event on the Anvil fork', timeout: 30_000 },
    )
    .toBe(true)

  const approvalLogs = await getErc20ApprovalLogsForOwner({
    fromBlock: baseline.fromBlock,
    owner,
    rpcUrl: anvilUrl,
    token: MAINNET_WETH,
  })
  const latestApprovalLog = getLatestSufficientApprovalLog(approvalLogs)

  if (!latestApprovalLog) {
    throw new Error('Expected a WETH Approval event on the Anvil fork')
  }

  const approvedAllowance = await readErc20Allowance({
    owner,
    rpcUrl: anvilUrl,
    spender: latestApprovalLog.spender,
    token: MAINNET_WETH,
  })

  expect(approvedAllowance).toBeGreaterThanOrEqual(APPROVAL_SELL_AMOUNT)

  await testInfo.attach('on-chain-approval-proof', {
    contentType: 'application/json',
    body: JSON.stringify(
      {
        chainId: MAINNET_CHAIN_ID,
        forkRpc: anvilUrl,
        owner,
        spender: latestApprovalLog.spender,
        token: MAINNET_WETH,
        initialAllowance: baseline.initialAllowance.toString(),
        approvedAllowance: approvedAllowance.toString(),
        approvedAllowanceFormatted: formatWethAmount(approvedAllowance),
        requiredAllowance: APPROVAL_SELL_AMOUNT.toString(),
        requiredAllowanceFormatted: formatWethAmount(APPROVAL_SELL_AMOUNT),
        approvalEvent: {
          blockNumber: latestApprovalLog.blockNumber.toString(),
          transactionHash: latestApprovalLog.transactionHash,
          value: latestApprovalLog.value.toString(),
          valueFormatted: formatWethAmount(latestApprovalLog.value),
        },
      },
      null,
      2,
    ),
  })
}
