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

  it('is false in dapp mode until the host lends a Solana wallet', () => {
    expect(isSolanaEnabledForWidget({ enableSolana: true, standaloneMode: false })).toBe(false)
    expect(isSolanaEnabledForWidget({ enableSolana: true, standaloneMode: false }, false)).toBe(false)
  })

  it('is true in dapp mode once the host lends a Solana wallet', () => {
    expect(isSolanaEnabledForWidget({ enableSolana: true, standaloneMode: false }, true)).toBe(true)
  })

  it('still needs the opt-in, even with a host Solana wallet', () => {
    expect(isSolanaEnabledForWidget({ standaloneMode: false }, true)).toBe(false)
  })

  it('ignores the host wallet in standalone mode, where the widget connects its own', () => {
    expect(isSolanaEnabledForWidget({ enableSolana: true, standaloneMode: true }, false)).toBe(true)
  })

  it('is unaffected by a partner fee, which simply is not charged on Solana', () => {
    expect(isSolanaEnabledForWidget({ enableSolana: true, partnerFee: PARTNER_FEE })).toBe(true)
  })
})
