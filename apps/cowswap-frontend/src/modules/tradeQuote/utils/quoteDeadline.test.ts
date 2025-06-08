import { MAX_VALID_TO_EPOCH } from '@cowprotocol/common-utils'
import { CrossChainQuoteAndPost } from '@cowprotocol/cow-sdk'

import { getOrderValidTo, getQuoteTimeOffset, isQuoteExpired } from './quoteDeadline'

import { DEFAULT_TRADE_QUOTE_STATE, TradeQuoteState } from '../state/tradeQuoteAtom'

interface QuoteDeadlineParams {
  validFor: number | undefined
  quoteValidTo: number | undefined
  localQuoteTimestamp: number | undefined
  expiration?: string
}

// 2024-04-16T10:54:01.334Z
const NOW_TIME = 1713264841334

const getQuoteState = ({
  validFor,
  localQuoteTimestamp,
  quoteValidTo,
  expiration,
}: QuoteDeadlineParams): TradeQuoteState =>
  ({
    ...DEFAULT_TRADE_QUOTE_STATE,
    localQuoteTimestamp,
    quote: {
      quoteResults: {
        tradeParameters: {
          validFor,
        },
        quoteResponse: {
          quote: {
            validTo: quoteValidTo,
          },
          expiration,
        },
      },
    } as CrossChainQuoteAndPost,
  }) as TradeQuoteState

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
describe('Quote deadline utils', () => {
  describe('getQuoteTimeOffset()', () => {
    it('When expected validTo and quote validTo are the same, then should return 0', () => {
      const validFor = 60 // 1 minute
      const localQuoteTimestamp = 1713167232

      expect(
        getQuoteTimeOffset(
          getQuoteState({
            validFor,
            localQuoteTimestamp,
            quoteValidTo: localQuoteTimestamp + validFor,
          }),
        ),
      ).toEqual(0)
    })

    it('When expected validTo bigger than quote validTo, then should return positive number', () => {
      const validFor = 60 // 1 minute
      const timeOffset = 120 * 60 // 2 hours
      const localQuoteTimestamp = 1713167232

      expect(
        getQuoteTimeOffset(
          getQuoteState({
            validFor,
            localQuoteTimestamp: localQuoteTimestamp + timeOffset,
            quoteValidTo: localQuoteTimestamp + validFor,
          }),
        ),
      ).toEqual(7200)
    })

    it('When expected validTo less than quote validTo, then should return positive number', () => {
      const validFor = 60 // 1 minute
      const timeOffset = -120 * 60 // -2 hours
      const localQuoteTimestamp = 1713167232

      expect(
        getQuoteTimeOffset(
          getQuoteState({
            validFor,
            localQuoteTimestamp: localQuoteTimestamp + timeOffset,
            quoteValidTo: localQuoteTimestamp + validFor,
          }),
        ),
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

      expect(getOrderValidTo(deadline, getQuoteState(quoteDeadlineParams))).toEqual(0)
    })

    it('ValidTo should be now + deadline + timeOffset', () => {
      const deadline = 5400 // 1.5 hours
      const offset = 3600 // 1 hour
      const quoteDeadlineParams = {
        validFor: deadline,
        quoteValidTo: NOW_TIME + deadline + offset,
        localQuoteTimestamp: NOW_TIME,
      }

      expect(getOrderValidTo(deadline, getQuoteState(quoteDeadlineParams))).toEqual(
        Math.floor(NOW_TIME / 1000 + deadline + offset),
      )
    })

    it('When the result is too big, then it should be capped by MAX_VALID_TO_EPOCH', () => {
      const deadline = 54000000000000000
      const quoteDeadlineParams = {
        validFor: deadline,
        quoteValidTo: NOW_TIME + deadline,
        localQuoteTimestamp: NOW_TIME,
      }

      expect(getOrderValidTo(deadline, getQuoteState(quoteDeadlineParams))).toEqual(MAX_VALID_TO_EPOCH)
    })
  })

  describe('isQuoteExpired()', () => {
    beforeEach(() => {
      // Freeze time
      Date.now = jest.fn(() => NOW_TIME)
    })

    it('When time offset is not defined, then result should be undefined', () => {
      const expirationDate = '2024-04-16T10:54:01.334Z'

      const deadlineParams = {
        validFor: undefined,
        quoteValidTo: undefined,
        localQuoteTimestamp: undefined,
        expiration: expirationDate,
      }

      expect(isQuoteExpired(getQuoteState(deadlineParams))).toBe(undefined)
    })

    it('When current time is further than expiration time, then should return true', () => {
      // Now is 10:54:01, expiration is 10:44:01
      const expirationDate = '2024-04-16T10:44:01.334Z'

      const deadline = 5400 // 1.5 hours
      const deadlineParams = {
        validFor: deadline,
        quoteValidTo: NOW_TIME + deadline,
        localQuoteTimestamp: NOW_TIME,
        expiration: expirationDate,
      }

      expect(isQuoteExpired(getQuoteState(deadlineParams))).toBe(true)
    })

    it('When current time is before the expiration time, then should return false', () => {
      // Now is 10:54:01, expiration is 11:04:01
      const expirationDate = '2024-04-16T11:04:01.334Z'

      const deadline = 5400 // 1.5 hours
      const deadlineParams = {
        validFor: deadline,
        quoteValidTo: NOW_TIME + deadline,
        localQuoteTimestamp: NOW_TIME,
        expiration: expirationDate,
      }

      expect(isQuoteExpired(getQuoteState(deadlineParams))).toBe(false)
    })

    it('When there is a time offset, then it should be taken into account', () => {
      // Now is 10:54:01, expiration is 10:44:01
      const expirationDate = '2024-04-16T10:44:01.334Z'

      const deadline = 5400 // 1.5 hours
      const offset = 3600 // 1 hour
      const deadlineParams = {
        validFor: deadline,
        quoteValidTo: NOW_TIME + deadline + offset,
        localQuoteTimestamp: NOW_TIME,
        expiration: expirationDate,
      }

      expect(isQuoteExpired(getQuoteState(deadlineParams))).toBe(true)
    })
  })
})
