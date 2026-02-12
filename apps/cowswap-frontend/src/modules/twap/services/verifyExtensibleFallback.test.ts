import { SupportedChainId, ZERO_ADDRESS } from '@cowprotocol/cow-sdk'
import { GPv2SettlementAbi } from '@cowprotocol/cowswap-abis'

import { readContract } from '@wagmi/core'
import { Config } from 'wagmi'

import { ExtensibleFallbackVerification, verifyExtensibleFallback } from './verifyExtensibleFallback'

import { ExtensibleFallbackContext } from '../hooks/useExtensibleFallbackContext'

jest.mock('@wagmi/core', () => ({
  readContract: jest.fn(),
  writeContract: jest.fn(),
}))

const context: ExtensibleFallbackContext = {
  chainId: SupportedChainId.SEPOLIA,
  config: {} as Config,
  safeAddress: '0x360Ba61Bc799edfa01e306f1eCCb2F6e0C3C8c8e',
  settlementContract: {
    abi: GPv2SettlementAbi,
    address: ZERO_ADDRESS,
  },
}

const mockReadContract = readContract as jest.MockedFunction<typeof readContract>

describe('verifyExtensibleFallback', () => {
  describe('When a safe has ExtensibleFallback', () => {
    it('And has ComposableCow as a domain verifier, then should return HAS_DOMAIN_VERIFIER', async () => {
      mockReadContract.mockResolvedValue('0xfdafc9d1902f4e0b84f65f49f244b32b31013b74')
      const result = await verifyExtensibleFallback(context)

      expect(result).toBe(ExtensibleFallbackVerification.HAS_DOMAIN_VERIFIER)
    })

    it('And does NOT have ComposableCow as a domain verifier, then should return HAS_EXTENSIBLE_FALLBACK', async () => {
      mockReadContract.mockResolvedValue(ZERO_ADDRESS)
      const result = await verifyExtensibleFallback(context)

      expect(result).toBe(ExtensibleFallbackVerification.HAS_EXTENSIBLE_FALLBACK)
    })
  })

  describe('When a safe does not have ExtensibleFallback', () => {
    it('Then should return HAS_NOTHING', async () => {
      mockReadContract.mockRejectedValue('Not a safe wallet')
      const result = await verifyExtensibleFallback(context)

      expect(result).toBe(ExtensibleFallbackVerification.HAS_NOTHING)
    })
  })
})
