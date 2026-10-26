import { humanizeWarningType } from './TokenWarningsBadge.utils'

describe('humanizeWarningType', () => {
  it('title-cases a screaming-snake type', () => {
    expect(humanizeWarningType('HAS_MINT_AUTHORITY')).toBe('Has Mint Authority')
  })

  it('keeps a leading rate intact', () => {
    expect(humanizeWarningType('1%_TRANSFER_FEES')).toBe('1% Transfer Fees')
    expect(humanizeWarningType('2.69%_TRANSFER_FEES')).toBe('2.69% Transfer Fees')
  })

  it('handles a single-word type', () => {
    expect(humanizeWarningType('NOT_SELLABLE')).toBe('Not Sellable')
  })

  it('renders every warning type the published file currently carries', () => {
    const types = [
      '0.2%_TRANSFER_FEES',
      'HAS_FREEZE_AUTHORITY',
      'HAS_MINT_AUTHORITY',
      'HAS_PERMANENT_DELEGATE',
      'HIGH_SINGLE_OWNERSHIP',
      'LOW_LIQUIDITY',
      'LOW_ORGANIC_ACTIVITY',
      'MUTABLE_TRANSFER_FEES',
      'NOT_SELLABLE',
      'NOT_VERIFIED',
      'VERY_LOW_TRADING_ACTIVITY',
    ]

    expect(types.map(humanizeWarningType)).toEqual([
      '0.2% Transfer Fees',
      'Has Freeze Authority',
      'Has Mint Authority',
      'Has Permanent Delegate',
      'High Single Ownership',
      'Low Liquidity',
      'Low Organic Activity',
      'Mutable Transfer Fees',
      'Not Sellable',
      'Not Verified',
      'Very Low Trading Activity',
    ])
  })
})
