import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'

import { isNativeAddress } from './tokens'

describe('tokens', () => {
  describe('isNativeAddress', () => {
    it('should return true if the token address is the native currency address', () => {
      expect(isNativeAddress('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', ChainId.MAINNET)).toBe(true)
      expect(isNativeAddress('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', ChainId.GNOSIS_CHAIN)).toBe(true)
    })

    it('should return false if the token address is not recognized', () => {
      expect(isNativeAddress('0x1234567890123456789012345678901234567890', ChainId.MAINNET)).toBe(false)
    })

    it('should return true if symbol is native currency', () => {
      expect(isNativeAddress('ETH', ChainId.MAINNET)).toBe(true)
      expect(isNativeAddress('eth', ChainId.MAINNET)).toBe(true)
      expect(isNativeAddress('xDAI', ChainId.GNOSIS_CHAIN)).toBe(true)
      expect(isNativeAddress('xdai', ChainId.GNOSIS_CHAIN)).toBe(true)
    })
  })
})
