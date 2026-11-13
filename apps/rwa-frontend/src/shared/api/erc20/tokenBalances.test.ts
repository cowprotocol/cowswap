import { BaseError, ContractFunctionExecutionError } from 'viem'

import { getAddressKey } from '@cowprotocol/cow-sdk'

import { readTokenBalances } from './tokenBalances'

import { getPublicClient } from '@/shared/lib/chain'

jest.mock('@/shared/lib/chain', () => ({ getPublicClient: jest.fn() }))

const getPublicClientMock = getPublicClient as jest.Mock
const multicall = jest.fn()

const OWNER = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
const TOKEN_A = '0x40461291347e1eCbb09499F3371D3f17f10d7159'
const TOKEN_B = '0x3e76BB02286BFeAA89DD35f11253f2CbCE634F91'

const batchFailure = {
  status: 'failure',
  error: new ContractFunctionExecutionError(new BaseError('HTTP request failed'), {
    abi: [],
    functionName: 'aggregate3',
  }),
}

describe('readTokenBalances', () => {
  beforeEach(() => {
    multicall.mockReset()
    getPublicClientMock.mockReset().mockReturnValue({ multicall })
  })

  it('returns the balances keyed by address key, leaving out the failed reads', async () => {
    multicall.mockResolvedValue([
      { status: 'success', result: 123n },
      { status: 'failure', error: new Error('reverted') },
    ])

    await expect(readTokenBalances(42161, OWNER, [TOKEN_A, TOKEN_B])).resolves.toEqual({
      [getAddressKey(TOKEN_A)]: '123',
    })
    expect(multicall.mock.calls[0][0].contracts[0]).toMatchObject({
      address: TOKEN_A,
      functionName: 'balanceOf',
      args: [OWNER],
    })
  })

  it('rejects when every batch failed', async () => {
    multicall.mockResolvedValue([batchFailure, batchFailure])

    await expect(readTokenBalances(42161, OWNER, [TOKEN_A, TOKEN_B])).rejects.toThrow('HTTP request failed')
  })

  it('rejects when one of the batches failed', async () => {
    multicall.mockResolvedValue([{ status: 'success', result: 123n }, batchFailure])

    await expect(readTokenBalances(42161, OWNER, [TOKEN_A, TOKEN_B])).rejects.toThrow('HTTP request failed')
  })

  it('rejects for a chain without RPC', async () => {
    getPublicClientMock.mockReturnValue(null)

    await expect(readTokenBalances(4663, OWNER, [TOKEN_A])).rejects.toThrow('No RPC for chain 4663')
  })
})
