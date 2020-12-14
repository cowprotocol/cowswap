import { getFeeAmount, GetFeeAmount } from './fee'

describe('Fee calculation', () => {
  describe('No amount, no variable fee', () => {
    it('No fees neither, feeAmount = 0', () => {
      const given: GetFeeAmount = {
        sellAmount: '0',
        minimalFee: '0',
        feeRatio: 0
      }
      const expected = '0'
      expect(getFeeAmount(given)).toEqual(expected)
    })

    it('With feeRatio, feeAmount still 0', () => {
      const given: GetFeeAmount = {
        sellAmount: '0',
        minimalFee: '0',
        feeRatio: 10
      }
      const expected = '0'
      expect(getFeeAmount(given)).toEqual(expected)
    })

    it('With minimal fee, feeAmount is equal to the minimal fee', () => {
      const given: GetFeeAmount = {
        sellAmount: '0',
        minimalFee: '1',
        feeRatio: 0
      }
      const expected = '1'
      expect(getFeeAmount(given)).toEqual(expected)
    })

    it('With feeRatio and minimal fee, feeAmount is equal to the minimal fee', () => {
      const given: GetFeeAmount = {
        sellAmount: '0',
        minimalFee: '1',
        feeRatio: 10
      }
      const expected = '1'
      expect(getFeeAmount(given)).toEqual(expected)
    })
  })

  describe('With amount', () => {
    it('No fees neither, feeAmount = 0', () => {
      const given: GetFeeAmount = {
        sellAmount: '1000000',
        minimalFee: '0',
        feeRatio: 0
      }
      const expected = '0'
      expect(getFeeAmount(given)).toEqual(expected)
    })

    it('With feeRatio, feeAmount is defined by the volume and fee ratio', () => {
      const given: GetFeeAmount = {
        sellAmount: '1000000', // 1M
        minimalFee: '0',
        feeRatio: 10 // 0.1%
      }
      const expected = '1000' // 1K
      expect(getFeeAmount(given)).toEqual(expected)
    })

    it('With feeRatio and a small minimalFee, feeAmount is defined by the volume and fee ratio', () => {
      const given: GetFeeAmount = {
        sellAmount: '1000000', // 1M
        minimalFee: '500', // 0.5K
        feeRatio: 10 // 0.1%
      }
      const expected = '1000' // 1K
      expect(getFeeAmount(given)).toEqual(expected)
    })

    it('With feeRatio and a big minimalFee, feeAmount is defined by the volume and fee ratio', () => {
      const given: GetFeeAmount = {
        sellAmount: '1000000', // 1M
        minimalFee: '1500', // 1.5K
        feeRatio: 10 // 0.1%
      }
      const expected = '1500' // 1K
      expect(getFeeAmount(given)).toEqual(expected)
    })
  })
})
