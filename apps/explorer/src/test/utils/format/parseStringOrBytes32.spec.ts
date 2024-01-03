import { parseStringOrBytes32 } from 'utils'

describe('parse string or bytes32', () => {
  test('parseStringOrBytes32 parse string', () => {
    const symbol = 'HEDG'
    expect(parseStringOrBytes32(symbol, 'UNKNOWN')).toMatch(symbol)
  })

  test('parseStringOrBytes32 parse bytes32', () => {
    const name = '0x4865646765547261646500000000000000000000000000000000000000000000'
    expect(parseStringOrBytes32(name, 'Token')).toMatch(/HedgeTrade/)
  })
})
