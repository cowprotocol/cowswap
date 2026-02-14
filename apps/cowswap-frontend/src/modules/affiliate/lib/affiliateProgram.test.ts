import { bffAffiliateApi } from 'modules/affiliate/api/bffAffiliateApi'

import { isOwnAffiliateCode } from './affiliateProgram'

jest.mock('modules/affiliate/api/bffAffiliateApi', () => ({
  bffAffiliateApi: {
    getAffiliateCode: jest.fn(),
  },
}))

describe('isOwnAffiliateCode', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns true when account affiliate code matches provided code', async () => {
    jest.mocked(bffAffiliateApi.getAffiliateCode).mockResolvedValue({
      code: 'my_code',
      createdAt: '2026-01-01T00:00:00.000Z',
      rewardAmount: 20,
      triggerVolume: 250000,
      timeCapDays: 90,
      volumeCap: 0,
      revenueSplitAffiliatePct: 50,
      revenueSplitTraderPct: 50,
      revenueSplitDaoPct: 0,
    })

    await expect(isOwnAffiliateCode({ account: '0xabc', code: 'MY_CODE' })).resolves.toBe(true)
  })

  it('returns false when account has no affiliate code', async () => {
    jest.mocked(bffAffiliateApi.getAffiliateCode).mockResolvedValue(null)

    await expect(isOwnAffiliateCode({ account: '0xabc', code: 'MY_CODE' })).resolves.toBe(false)
  })

  it('returns false when account affiliate code differs', async () => {
    jest.mocked(bffAffiliateApi.getAffiliateCode).mockResolvedValue({
      code: 'OTHER_CODE',
      createdAt: '2026-01-01T00:00:00.000Z',
      rewardAmount: 20,
      triggerVolume: 250000,
      timeCapDays: 90,
      volumeCap: 0,
      revenueSplitAffiliatePct: 50,
      revenueSplitTraderPct: 50,
      revenueSplitDaoPct: 0,
    })

    await expect(isOwnAffiliateCode({ account: '0xabc', code: 'MY_CODE' })).resolves.toBe(false)
  })

  it('returns false when affiliate lookup fails', async () => {
    jest.mocked(bffAffiliateApi.getAffiliateCode).mockRejectedValue(new Error('network'))

    await expect(isOwnAffiliateCode({ account: '0xabc', code: 'MY_CODE' })).resolves.toBe(false)
  })
})
