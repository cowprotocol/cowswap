import { isSolanaEnabledForWidget } from './solanaAccess'

const PARTNER_FEE = { bps: 50, recipient: '0x22af3D38E50ddedeb7C47f36faB321eC3Bb72A76' }

describe('isSolanaEnabledForWidget', () => {
  it('is false without the opt-in', () => {
    expect(isSolanaEnabledForWidget({})).toBe(false)
    expect(isSolanaEnabledForWidget({ enableSolana: false })).toBe(false)
  })

  it('is true for an opted-in widget, standalone by default', () => {
    expect(isSolanaEnabledForWidget({ enableSolana: true })).toBe(true)
    expect(isSolanaEnabledForWidget({ enableSolana: true, standaloneMode: true })).toBe(true)
  })

  it('is false in dapp mode, which has no wallet that can sign on Solana', () => {
    expect(isSolanaEnabledForWidget({ enableSolana: true, standaloneMode: false })).toBe(false)
  })

  it('is unaffected by a partner fee, which simply is not charged on Solana', () => {
    expect(isSolanaEnabledForWidget({ enableSolana: true, partnerFee: PARTNER_FEE })).toBe(true)
  })
})
