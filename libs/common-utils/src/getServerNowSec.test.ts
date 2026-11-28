import { getServerNowSec } from './getServerNowSec'

describe('getServerNowSec', () => {
  const NOW_MS = 1_700_000_000_000

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW_MS)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('subtracts the quote time offset', () => {
    expect(getServerNowSec(120)).toBe(1_700_000_000 - 120)
  })

  it('treats a missing offset as 0', () => {
    expect(getServerNowSec(undefined)).toBe(1_700_000_000)
  })
})
