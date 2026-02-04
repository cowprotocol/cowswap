import { getAddressKey } from '@cowprotocol/cow-sdk'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Nullish } from '@cowprotocol/types'
import { defaultAbiCoder } from '@ethersproject/abi'
import type { TransactionReceipt } from '@ethersproject/abstract-provider'
import { getAddress } from '@ethersproject/address'
import { id } from '@ethersproject/hash'
import { Currency, Token } from '@uniswap/sdk-core'

import { SetOptimisticAllowanceParams } from 'entities/optimisticAllowance/useSetOptimisticAllowance'

// ERC20 Approval event signature: Approval(address indexed owner, address indexed spender, uint256 value)
const APPROVAL_EVENT_TOPIC = id('Approval(address,address,uint256)')

interface ApprovalTransactionParams {
  chainId: SupportedChainId
  account: string | undefined
  spender: string | undefined
  currency: Nullish<Currency>
}

export function processApprovalTransaction(
  { chainId, currency, account, spender }: ApprovalTransactionParams,
  txResponse: TransactionReceipt,
): SetOptimisticAllowanceParams | null {
  if (txResponse.status !== 1) {
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
  txReceipt: TransactionReceipt,
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
      const logOwner = getAddress('0x' + log.topics[1].slice(26))
      const logSpender = getAddress('0x' + log.topics[2].slice(26))

      return getAddressKey(logOwner) === getAddressKey(owner) && getAddressKey(logSpender) === getAddressKey(spender)
    })

    if (!approvalLog) return undefined

    // Parse the value from log data (3rd parameter of Approval event)
    const value = defaultAbiCoder.decode(['uint256'], approvalLog.data)[0]

    return BigInt(value.toString())
  } catch (error) {
    console.error('Error extracting approval amount from logs:', error)
    return undefined
  }
}
