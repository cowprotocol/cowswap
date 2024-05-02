import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { validatePartnerFee } from './validatePartnerFee'

import { PARTNER_FEE_MAX_BPS } from '../consts'

describe('validatePartnerFee()', () => {
  it(`When BPS is higher than ${PARTNER_FEE_MAX_BPS}, then should return error`, () => {
    const result = validatePartnerFee({
      bps: 200,
      recipient: '0x0000000000000000000000000000000000000000',
    })

    expect(result).toEqual(['Partner fee can not be more than 100 BPS!'])
  })

  it('When BPS is less than zero, then should return error', () => {
    const result = validatePartnerFee({
      bps: -1,
      recipient: '0x0000000000000000000000000000000000000000',
    })

    expect(result).toEqual(['Partner fee can not be less than 0!'])
  })

  it('When recipient is empty, then should return error', () => {
    const result = validatePartnerFee({
      bps: 100,
      recipient: '',
    })

    expect(result).toEqual(['Partner fee recipient must be set!'])
  })

  describe('When recipient is a string', () => {
    it('When recipient is not a valid address, then should return error', () => {
      const result = validatePartnerFee({
        bps: 100,
        recipient: 'asvbfbdf',
      })

      expect(result).toEqual([
        'invalid address (argument="address", value="asvbfbdf", code=INVALID_ARGUMENT, version=address/5.7.0)',
      ])
    })

    it('When the recipient is valid, then should return undefined', () => {
      const result = validatePartnerFee({
        bps: 100,
        recipient: '0x0000000000000000000000000000000000000000',
      })

      expect(result).toBe(undefined)
    })
  })

  describe('When recipient is a map', () => {
    it('When one of addresses is not a valid address, then should return error', () => {
      const result = validatePartnerFee({
        bps: 100,
        recipient: {
          [SupportedChainId.MAINNET]: '0x0000000000000000000000000000000000000000',
          [SupportedChainId.GNOSIS_CHAIN]: 'rtrth',
          [SupportedChainId.SEPOLIA]: '0x0000000000000000000000000000000000000000',
        },
      })

      expect(result).toEqual([
        'invalid address (argument="address", value="rtrth", code=INVALID_ARGUMENT, version=address/5.7.0)',
      ])
    })

    it('When all addresses are valid, then should return undefined', () => {
      const result = validatePartnerFee({
        bps: 100,
        recipient: {
          [SupportedChainId.MAINNET]: '0x0000000000000000000000000000000000000000',
          [SupportedChainId.GNOSIS_CHAIN]: '0x0000000000000000000000000000000000000000',
          [SupportedChainId.SEPOLIA]: '0x0000000000000000000000000000000000000000',
        },
      })

      expect(result).toBe(undefined)
    })
  })
})
