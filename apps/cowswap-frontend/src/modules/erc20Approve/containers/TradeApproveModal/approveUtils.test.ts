import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@uniswap/sdk-core'

import { encodeAbiParameters } from 'viem'

import { toKeccak256 } from 'common/utils/toKeccak256'

import { processApprovalTransaction } from './approveUtils'

import type { Hex, TransactionReceipt } from 'viem'

const APPROVAL_EVENT_TOPIC = toKeccak256('Approval(address,address,uint256)') as Hex

describe('processApprovalTransaction', () => {
  const mockChainId = SupportedChainId.MAINNET
  const mockTokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  const mockAccount = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
  const mockSpender = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'
  const mockAmount = BigInt('1000000000000000000')
  const mockBlockNumber = 123456n

  const mockToken = new Token(mockChainId, mockTokenAddress, 18, 'TEST', 'Test Token')

  // Helper to create padded address topic
  const createAddressTopic = (address: string): Hex => {
    return `0x${'0'.repeat(24)}${address.slice(2).toLowerCase()}`
  }

  // Helper to encode approval amount
  const encodeAmount = (amount: bigint): Hex => {
    return encodeAbiParameters([{ type: 'uint256' }], [amount])
  }

  const createMockTransactionReceipt = (
    status: 'success' | 'reverted',
    logs: TransactionReceipt['logs'] = [],
  ): TransactionReceipt => {
    return {
      to: mockSpender,
      from: mockAccount,
      contractAddress: mockTokenAddress,
      transactionIndex: 1,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      gasUsed: { toString: () => '21000' } as any,
      logsBloom: '0x',
      blockHash: '0xblockhash',
      transactionHash: '0xtxhash',
      logs,
      blockNumber: mockBlockNumber,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cumulativeGasUsed: { toString: () => '21000' } as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      effectiveGasPrice: { toString: () => '1000000000' } as any,
      type: 'legacy',
      status,
    }
  }

  const createApprovalLog = (
    tokenAddress: string,
    owner: string,
    spender: string,
    amount: bigint,
  ): TransactionReceipt['logs'][0] => {
    return {
      blockNumber: mockBlockNumber,
      blockHash: '0xblockhash',
      transactionIndex: 1,
      removed: false,
      address: tokenAddress,
      data: encodeAmount(amount),
      topics: [APPROVAL_EVENT_TOPIC, createAddressTopic(owner), createAddressTopic(spender)],
      transactionHash: '0xtxhash',
      logIndex: 0,
    }
  }

  describe('successful approval extraction', () => {
    it('should extract approval data from valid transaction receipt', () => {
      const approvalLog = createApprovalLog(mockTokenAddress, mockAccount, mockSpender, mockAmount)
      const txReceipt = createMockTransactionReceipt('success', [approvalLog])

      const result = processApprovalTransaction(
        {
          chainId: mockChainId,
          currency: mockToken,
          account: mockAccount,
          spender: mockSpender,
        },
        txReceipt,
      )

      expect(result).toEqual({
        tokenAddress: mockTokenAddress.toLowerCase(),
        owner: mockAccount,
        spender: mockSpender,
        amount: mockAmount,
        blockNumber: mockBlockNumber,
        chainId: mockChainId,
      })
    })

    it('should handle zero approval amount (revoke approval)', () => {
      const zeroAmount = BigInt('0')
      const approvalLog = createApprovalLog(mockTokenAddress, mockAccount, mockSpender, zeroAmount)
      const txReceipt = createMockTransactionReceipt('success', [approvalLog])

      const result = processApprovalTransaction(
        {
          chainId: mockChainId,
          currency: mockToken,
          account: mockAccount,
          spender: mockSpender,
        },
        txReceipt,
      )

      expect(result).toEqual({
        tokenAddress: mockTokenAddress.toLowerCase(),
        owner: mockAccount,
        spender: mockSpender,
        amount: zeroAmount,
        blockNumber: mockBlockNumber,
        chainId: mockChainId,
      })
    })

    it('should find correct approval log among multiple logs', () => {
      const otherLog = {
        blockNumber: mockBlockNumber,
        blockHash: '0xblockhash' as Hex,
        transactionIndex: 1,
        removed: false,
        address: '0xOtherAddress000000000000000000000000000000',
        data: '0x' as Hex,
        topics: ['0xothertopic'] as [Hex, ...Hex[]],
        transactionHash: '0xtxhash' as Hex,
        logIndex: 0,
      }
      const approvalLog = createApprovalLog(mockTokenAddress, mockAccount, mockSpender, mockAmount)
      const txReceipt = createMockTransactionReceipt('success', [otherLog, approvalLog, otherLog])

      const result = processApprovalTransaction(
        {
          chainId: mockChainId,
          currency: mockToken,
          account: mockAccount,
          spender: mockSpender,
        },
        txReceipt,
      )

      expect(result).toEqual({
        tokenAddress: mockTokenAddress.toLowerCase(),
        owner: mockAccount,
        spender: mockSpender,
        amount: mockAmount,
        blockNumber: mockBlockNumber,
        chainId: mockChainId,
      })
    })
  })

  describe('failed transaction handling', () => {
    it('should throw error when transaction status is not 1', () => {
      const approvalLog = createApprovalLog(mockTokenAddress, mockAccount, mockSpender, mockAmount)
      const txReceipt = createMockTransactionReceipt('reverted', [approvalLog])

      expect(() =>
        processApprovalTransaction(
          {
            chainId: mockChainId,
            currency: mockToken,
            account: mockAccount,
            spender: mockSpender,
          },
          txReceipt,
        ),
      ).toThrow('Approval transaction failed')
    })

    it('should throw error when transaction status is undefined', () => {
      const approvalLog = createApprovalLog(mockTokenAddress, mockAccount, mockSpender, mockAmount)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const txReceipt = createMockTransactionReceipt(undefined as any, [approvalLog])

      expect(() =>
        processApprovalTransaction(
          {
            chainId: mockChainId,
            currency: mockToken,
            account: mockAccount,
            spender: mockSpender,
          },
          txReceipt,
        ),
      ).toThrow('Approval transaction failed')
    })
  })

  describe('real-world scenarios', () => {
    it('should handle user changing approval amount in wallet', () => {
      // User was asked to approve 1 token but changed to 5 in wallet
      const requestedAmount = BigInt('1000000000000000000')
      const actualAmount = BigInt('5000000000000000000')

      const approvalLog = createApprovalLog(mockTokenAddress, mockAccount, mockSpender, actualAmount)
      const txReceipt = createMockTransactionReceipt('success', [approvalLog])

      const result = processApprovalTransaction(
        {
          chainId: mockChainId,
          currency: mockToken,
          account: mockAccount,
          spender: mockSpender,
        },
        txReceipt,
      )

      expect(result?.amount).toBe(actualAmount)
      expect(result?.amount).not.toBe(requestedAmount)
    })

    it('should handle multiple approval events and select correct one', () => {
      const otherSpender = '0x1234567890123456789012345678901234567890'
      const otherAmount = BigInt('2000000000000000000')

      // Create two approval logs - one for the target spender and one for another
      const wrongApprovalLog = createApprovalLog(mockTokenAddress, mockAccount, otherSpender, otherAmount)
      const correctApprovalLog = createApprovalLog(mockTokenAddress, mockAccount, mockSpender, mockAmount)

      const txReceipt = createMockTransactionReceipt('success', [wrongApprovalLog, correctApprovalLog])

      const result = processApprovalTransaction(
        {
          chainId: mockChainId,
          currency: mockToken,
          account: mockAccount,
          spender: mockSpender,
        },
        txReceipt,
      )

      expect(result?.amount).toBe(mockAmount)
      expect(result?.spender).toBe(mockSpender)
    })
  })
})
