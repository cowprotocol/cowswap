import { isRecord } from './json-utils'

describe('json-utils', () => {
  describe('isRecord', () => {
    it('accepts plain records', () => {
      expect(isRecord({})).toBe(true)
      expect(isRecord({ value: 'cow' })).toBe(true)
    })

    it('rejects non-record values', () => {
      expect(isRecord(null)).toBe(false)
      expect(isRecord(undefined)).toBe(false)
      expect(isRecord([])).toBe(false)
      expect(isRecord(new Date())).toBe(false)
      expect(isRecord('cow')).toBe(false)
      expect(isRecord(1)).toBe(false)
    })
  })
})
