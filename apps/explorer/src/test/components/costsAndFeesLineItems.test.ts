import { getAddressKey } from '@cowprotocol/cow-sdk'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'

import { ProtocolFee, ProtocolFeeOwner, ProtocolFeeType } from 'api/operator'

import { buildLineItems, indexTokensByKey, sumByToken } from '../../components/orders/GasFeeDisplay/breakdown'
import { TUSD, USDT, WETH } from '../data'

const NATIVE_KEY = getAddressKey('0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
const GAS_COST = new BigNumber('2500000000000000')

function fee(
  type: ProtocolFeeType,
  token: string,
  amount: string,
  position = 0,
  owner = ProtocolFeeOwner.Protocol,
  partnerNumber?: number,
): ProtocolFee {
  return { type, tokenAddress: getAddressKey(token), amount: new BigNumber(amount), position, owner, partnerNumber }
}

function partnerFee(
  type: ProtocolFeeType,
  token: string,
  amount: string,
  position: number,
  partnerNumber: number,
): ProtocolFee {
  return fee(type, token, amount, position, ProtocolFeeOwner.Partner, partnerNumber)
}

describe('buildLineItems', () => {
  it('puts the network costs first, in the native token', () => {
    const items = buildLineItems([fee(ProtocolFeeType.Volume, USDT.address, '400000')], GAS_COST, NATIVE_KEY)

    expect(items[0]).toEqual({ label: 'Network costs', tokenAddress: NATIVE_KEY, amount: GAS_COST })
  })

  it('keeps the fees in the order they were applied', () => {
    const items = buildLineItems(
      [
        fee(ProtocolFeeType.PriceImprovement, WETH.address, '1'),
        partnerFee(ProtocolFeeType.Volume, USDT.address, '2', 1, 1),
      ],
      GAS_COST,
      NATIVE_KEY,
    )

    expect(items.map((item) => item.label)).toEqual([
      'Network costs',
      'DAO price improvement share',
      'Partner 1 volume fee',
    ])
  })

  it('numbers a label that still repeats, so the rows stay distinguishable', () => {
    const items = buildLineItems(
      [
        partnerFee(ProtocolFeeType.Volume, WETH.address, '1', 0, 1),
        fee(ProtocolFeeType.Surplus, WETH.address, '2', 1),
        partnerFee(ProtocolFeeType.Volume, USDT.address, '3', 2, 1),
      ],
      GAS_COST,
      NATIVE_KEY,
    )

    // Same partner, same kind of fee, twice; the surplus fee is alone so it keeps its plain label.
    expect(items.map((item) => item.label)).toEqual([
      'Network costs',
      'Partner 1 volume fee (1)',
      'DAO price improvement share',
      'Partner 1 volume fee (2)',
    ])
  })

  it('falls back to the plain fee names for an unrecognised policy', () => {
    const items = buildLineItems(
      [fee(ProtocolFeeType.Unknown, USDT.address, '1'), partnerFee(ProtocolFeeType.Unknown, USDT.address, '2', 1, 1)],
      GAS_COST,
      NATIVE_KEY,
    )

    expect(items.map((item) => item.label)).toEqual(['Network costs', 'Protocol fee', 'Partner 1 fee'])
  })

  it('names the protocol fees and numbers the partners, per the agreed labels', () => {
    const items = buildLineItems(
      [
        fee(ProtocolFeeType.PriceImprovement, WETH.address, '1'),
        fee(ProtocolFeeType.Volume, WETH.address, '2', 1),
        partnerFee(ProtocolFeeType.Volume, USDT.address, '3', 2, 1),
        partnerFee(ProtocolFeeType.PriceImprovement, USDT.address, '4', 3, 1),
        partnerFee(ProtocolFeeType.Volume, TUSD.address, '5', 4, 2),
      ],
      GAS_COST,
      NATIVE_KEY,
    )

    expect(items.map((item) => item.label)).toEqual([
      'Network costs',
      'DAO price improvement share',
      'Protocol fee',
      'Partner 1 volume fee',
      'Partner 1 price improvement share',
      'Partner 2 volume fee',
    ])
  })

  it('labels the protocol surplus fee as the DAO price improvement share', () => {
    const items = buildLineItems([fee(ProtocolFeeType.Surplus, WETH.address, '1')], GAS_COST, NATIVE_KEY)

    expect(items[1].label).toBe('DAO price improvement share')
  })
})

describe('sumByToken', () => {
  it('adds up the amounts of each token, keeping first-seen order', () => {
    const items = buildLineItems(
      [fee(ProtocolFeeType.Volume, USDT.address, '400000'), fee(ProtocolFeeType.Surplus, USDT.address, '600000', 1)],
      GAS_COST,
      NATIVE_KEY,
    )

    expect(sumByToken(items)).toEqual([
      [NATIVE_KEY, GAS_COST],
      [getAddressKey(USDT.address), new BigNumber('1000000')],
    ])
  })

  it('keeps wrapped native separate from native', () => {
    const items = buildLineItems([fee(ProtocolFeeType.Volume, WETH.address, '10')], GAS_COST, NATIVE_KEY)

    expect(sumByToken(items)).toHaveLength(2)
  })
})

describe('indexTokensByKey', () => {
  it('indexes by address key and skips the tokens that failed to load', () => {
    const map = indexTokensByKey([WETH as TokenErc20, undefined, null, USDT as TokenErc20])

    expect(map.get(getAddressKey(WETH.address))).toBe(WETH)
    expect(map.get(getAddressKey(USDT.address))).toBe(USDT)
    expect(map.get(getAddressKey(TUSD.address))).toBeUndefined()
    expect(map.size).toBe(2)
  })

  it('lets a later entry win, so order metadata overrides a partial fee-token lookup', () => {
    const partial = { ...WETH, symbol: undefined } as unknown as TokenErc20
    const map = indexTokensByKey([partial, WETH as TokenErc20])

    expect(map.get(getAddressKey(WETH.address))).toBe(WETH)
  })
})
