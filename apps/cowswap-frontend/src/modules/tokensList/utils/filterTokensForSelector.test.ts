import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

import { Field } from 'legacy/state/types'

import { filterTokensForSelector, getTokenSelectorFilter, isTokenSelectorFiltered } from './filterTokensForSelector'

const createToken = (address: string, symbol: string): TokenWithLogo =>
  ({ address, chainId: SupportedChainId.MAINNET, decimals: 18, symbol, name: symbol }) as TokenWithLogo

const usdc = createToken('0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 'USDC')
const aaplOndo = createToken('0x14C3abF95Cb9C93a8b82C1CdCB76D72Cb87b2d4c', 'AAPLon')
const aaplX = createToken('0x9d275685dC284C8eB1C79f6ABA7a63Dc75ec890a', 'AAPLx')
const tokens = [usdc, aaplOndo, aaplX]

describe('filterTokensForSelector', () => {
  it('keeps every token without a filter', () => {
    expect(filterTokensForSelector(tokens, undefined, null)).toBe(tokens)
  })

  it('keeps the given tokens, whatever the address casing', () => {
    const filter = { tokens: ['0x14c3abf95cb9c93a8b82c1cdcb76d72cb87b2d4c', aaplX.address] }

    expect(filterTokensForSelector(tokens, filter, null)).toEqual([aaplOndo, aaplX])
  })

  it('keeps the tokens with a balance', () => {
    const balances = { [getAddressKey(usdc.address)]: 10n, [getAddressKey(aaplOndo.address)]: 0n }

    expect(filterTokensForSelector(tokens, { onlyWithBalance: true }, balances)).toEqual([usdc])
  })

  it('combines the given tokens with the balances', () => {
    const balances = { [getAddressKey(usdc.address)]: 10n, [getAddressKey(aaplX.address)]: 1n }
    const filter = { tokens: [aaplOndo.address, aaplX.address], onlyWithBalance: true }

    expect(filterTokensForSelector(tokens, filter, balances)).toEqual([aaplX])
  })
})

describe('isTokenSelectorFiltered', () => {
  it('is false for a notice alone', () => {
    expect(isTokenSelectorFiltered({ notice: 'Only tokens you hold' })).toBe(false)
  })

  it('is true for given tokens or tokens with balance', () => {
    expect(isTokenSelectorFiltered({ tokens: [] })).toBe(true)
    expect(isTokenSelectorFiltered({ onlyWithBalance: true })).toBe(true)
  })
})

describe('getTokenSelectorFilter', () => {
  const params = { sellTokensFilter: { onlyWithBalance: true }, buyTokensFilter: { tokens: [aaplX.address] } }

  it('returns the filter of the selected field', () => {
    expect(getTokenSelectorFilter(Field.INPUT, params)).toBe(params.sellTokensFilter)
    expect(getTokenSelectorFilter(Field.OUTPUT, params)).toBe(params.buyTokensFilter)
    expect(getTokenSelectorFilter(undefined, params)).toBeUndefined()
  })
})
