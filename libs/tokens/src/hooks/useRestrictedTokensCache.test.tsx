import { isTimeToUpdate } from './useRestrictedTokensCache'

import {
  RESTRICTED_TOKENS_LAST_UPDATE_KEY,
  restrictedTokensLastUpdateStorage,
} from '../state/restrictedTokens/restrictedTokensAtom'

const FRESH_LAST_UPDATE_TIME = 1_700_000_000_000
const NOW = FRESH_LAST_UPDATE_TIME + 60_000

describe('useRestrictedTokensCache', () => {
  let dateNowSpy: jest.SpyInstance<number, []>

  beforeEach(() => {
    localStorage.clear()
    dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(NOW)
  })

  afterEach(() => {
    dateNowSpy.mockRestore()
    localStorage.clear()
  })

  it('restores a persisted timestamp as a fresh number', () => {
    localStorage.setItem(RESTRICTED_TOKENS_LAST_UPDATE_KEY, JSON.stringify(FRESH_LAST_UPDATE_TIME))

    const restoredLastUpdateTime = restrictedTokensLastUpdateStorage.getItem(RESTRICTED_TOKENS_LAST_UPDATE_KEY, 0)

    expect(restoredLastUpdateTime).toBe(FRESH_LAST_UPDATE_TIME)
    expect(isTimeToUpdate(restoredLastUpdateTime)).toBe(false)
  })
})
