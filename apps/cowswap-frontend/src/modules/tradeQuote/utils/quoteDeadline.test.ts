import { MAX_VALID_TO_EPOCH } from '@cowprotocol/common-utils'

import { getOrderValidTo, getQuoteTimeOffset } from './quoteDeadline'

const NOW_TIME = 1713264841334

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

  describe('getOrderValidTo()', () => {
    beforeEach(() => {
      // Freeze time
      Date.now = jest.fn(() => NOW_TIME)
    })

    it('When time offset is not defined, then should be zero', () => {
      const deadline = 10
      const quoteDeadlineParams = {
        validFor: undefined,
        quoteValidTo: undefined,
        localQuoteTimestamp: undefined,
      }

      expect(getOrderValidTo(deadline, quoteDeadlineParams)).toEqual(0)
    })

    it('ValidTo should be now + deadline + timeOffset', () => {
      const deadline = 5400 // 1.5 hours
      const offset = 3600 // 1 hour
      const quoteDeadlineParams = {
        validFor: deadline,
        quoteValidTo: NOW_TIME + deadline + offset,
        localQuoteTimestamp: NOW_TIME,
      }

      expect(getOrderValidTo(deadline, quoteDeadlineParams)).toEqual(Math.floor(NOW_TIME / 1000 + deadline + offset))
    })

    it('When the result is too big, then it should be capped by MAX_VALID_TO_EPOCH', () => {
      const deadline = 54000000000000000
      const quoteDeadlineParams = {
        validFor: deadline,
        quoteValidTo: NOW_TIME + deadline,
        localQuoteTimestamp: NOW_TIME,
      }

      expect(getOrderValidTo(deadline, quoteDeadlineParams)).toEqual(MAX_VALID_TO_EPOCH)
    })
  })
})
