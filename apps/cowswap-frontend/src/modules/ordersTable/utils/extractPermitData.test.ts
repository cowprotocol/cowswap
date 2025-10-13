import { extractPermitData } from './extractPermitData'

describe('extractPermitData', () => {
  describe('unsupported permit', () => {
    it('should return unsupported for unknown selector', () => {
      const unknownCallData = '0xunknown' + '0'.repeat(512)

      const result = extractPermitData(unknownCallData)

      expect(result.permitNonce).toBeNull()
      expect(result.permitAmount).toBeNull()
      expect(result.permitType).toBe('unsupported')
    })
  })

  describe('error handling', () => {
    it('should handle invalid call data gracefully', () => {
      const invalidCallData = 'invalid_data'

      const result = extractPermitData(invalidCallData)

      expect(result.permitNonce).toBeNull()
      expect(result.permitAmount).toBeNull()
      expect(result.permitType).toBe('unsupported')
    })
  })
})
