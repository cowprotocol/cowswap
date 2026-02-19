import { calculateGasMargin } from './calculateGasMargin'

describe('#calculateGasMargin', () => {
  it('adds 20%', () => {
    expect(calculateGasMargin(1000n).toString()).toEqual('1200')
    expect(calculateGasMargin(50n).toString()).toEqual('60')
  })
})
