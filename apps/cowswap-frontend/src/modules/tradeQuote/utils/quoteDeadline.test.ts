import { getQuoteTimeOffset } from './quoteDeadline'

describe('Quote deadline utils', () => {
  describe('getQuoteTimeOffset()', () => {
    it('When expected validTo and quote validTo are the same, then should return 0', () => {
      const validFor = 60 // 1 minute
      const localQuoteTimestamp = 1713167232

      expect(
        getQuoteTimeOffset({
          validFor,
          localQuoteTimestamp,
          quoteValidTo: localQuoteTimestamp + validFor,
        })
      ).toEqual(0)
    })

    it('When expected validTo bigger than quote validTo, then should return positive number', () => {
      const validFor = 60 // 1 minute
      const timeOffset = 120 * 60 // 2 hours
      const localQuoteTimestamp = 1713167232

      expect(
        getQuoteTimeOffset({
          validFor,
          localQuoteTimestamp: localQuoteTimestamp + timeOffset,
          quoteValidTo: localQuoteTimestamp + validFor,
        })
      ).toEqual(7200)
    })

    it('When expected validTo less than quote validTo, then should return positive number', () => {
      const validFor = 60 // 1 minute
      const timeOffset = -120 * 60 // -2 hours
      const localQuoteTimestamp = 1713167232

      expect(
        getQuoteTimeOffset({
          validFor,
          localQuoteTimestamp: localQuoteTimestamp + timeOffset,
          quoteValidTo: localQuoteTimestamp + validFor,
        })
      ).toEqual(-7200)
    })
  })
})
