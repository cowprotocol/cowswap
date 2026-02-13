import { SupportedChainId, ZERO_ADDRESS } from '@cowprotocol/cow-sdk'
import { GPv2SettlementAbi } from '@cowprotocol/cowswap-abis'

import { writeContract } from 'wagmi/actions'

import { extensibleFallbackSetupTxs } from './extensibleFallbackSetupTxs'

import { ExtensibleFallbackContext } from '../hooks/useExtensibleFallbackContext'

import type { Config } from 'wagmi'

jest.mock('wagmi/actions', () => ({
  writeContract: jest.fn(),
}))

const mockWriteContract = writeContract as jest.MockedFunction<typeof writeContract>

describe('extensibleFallbackSetupTxs - service to generate transactions for ExtensibleFallback setup', () => {
  it('Should create a bundle of two transactions: setFallbackHandler and setDomainVerifier', async () => {
    const context: ExtensibleFallbackContext = {
      chainId: SupportedChainId.SEPOLIA,
      config: {} as Config,
      safeAddress: '0xA12D770028d7072b80BAEb6A1df962cccfd1dddd',
      settlementContract: {
        abi: GPv2SettlementAbi,
        address: ZERO_ADDRESS,
      },
    }

    mockWriteContract.mockResolvedValue('0xa5b986c2f5845d520bcb903639360b147735589732066cea24a3a59678025c94')

    const result = await extensibleFallbackSetupTxs(context)

    expect(result).toMatchSnapshot()
  })
})
