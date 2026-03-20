import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, Token } from '@cowprotocol/currency'
import { Nullish } from '@cowprotocol/types'

import { SetOptimisticAllowanceParams } from 'entities/optimisticAllowance/useSetOptimisticAllowance'
import { decodeAbiParameters, getAddress, keccak256, stringToBytes } from 'viem'

// ERC20 Approval event signature: Approval(address indexed owner, address indexed spender, uint256 value)
const APPROVAL_EVENT_TOPIC = keccak256(stringToBytes('Approval(address,address,uint256)'))

interface ApprovalTransactionParams {
  chainId: SupportedChainId
  account: string | undefined
  spender: string | undefined
  currency: Nullish<Currency>
}

export type ApprovalTxReceipt = {
  status: 'success' | 'reverted'
  blockNumber: bigint
  transactionHash: `0x${string}`
  logs: Array<{ address: string; topics: string[]; data: `0x${string}` }>
}

export function processApprovalTransaction(
  { chainId, currency, account, spender }: ApprovalTransactionParams,
  txResponse: ApprovalTxReceipt,
): SetOptimisticAllowanceParams | null {
  if (txResponse.status !== 'success') {
    throw new Error('Approval transaction failed')
  }

  // Set optimistic allowance immediately after transaction is mined
  // Extract the actual approved amount from transaction logs
  if (currency && account && spender && chainId) {
    const tokenAddress = (currency as Token).address

    if (tokenAddress) {
      const approvedAmount = extractApprovalAmountFromLogs(txResponse, tokenAddress, account, spender)

      if (approvedAmount !== undefined) {
        return {
          tokenAddress: getAddressKey(tokenAddress),
          owner: account,
          spender,
          amount: approvedAmount,
          blockNumber: txResponse.blockNumber,
          chainId,
        }
      }
    }
  }

  return null
}

/**
 * Extracts the approved amount from the Approval event in transaction logs
 * @param txReceipt Transaction receipt containing logs
 * @param tokenAddress Token contract address
 * @param owner Address of the token owner
 * @param spender Address of the spender
 * @returns The approved amount as bigint, or undefined if not found
 */
function extractApprovalAmountFromLogs(
  txReceipt: ApprovalTxReceipt,
  tokenAddress: string,
  owner: string,
  spender: string,
): bigint | undefined {
  try {
    // Find the Approval event log
    const approvalLog = txReceipt.logs.find((log) => {
      // Check if it's from the token contract and has the Approval event signature
      if (getAddressKey(log.address) !== getAddressKey(tokenAddress)) return false
      if (log.topics[0] !== APPROVAL_EVENT_TOPIC) return false

      // Verify owner and spender match (topics[1] = owner, topics[2] = spender)
      const logOwner = getAddress(('0x' + log.topics[1].slice(26)) as `0x${string}`)
      const logSpender = getAddress(('0x' + log.topics[2].slice(26)) as `0x${string}`)

      return getAddressKey(logOwner) === getAddressKey(owner) && getAddressKey(logSpender) === getAddressKey(spender)
    })

    if (!approvalLog) return undefined

    // Parse the value from log data (3rd parameter of Approval event)
    const [value] = decodeAbiParameters([{ type: 'uint256' }], approvalLog.data)

    return value
  } catch (error) {
    console.error('Error extracting approval amount from logs:', error)
    return undefined
  }
}
