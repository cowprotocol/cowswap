import { COOKIE_CONSENT_NAME } from './cookieConsent.constants'
import { clearTrackerStorage, getCookieDomainCandidates } from './trackerStorage.utils'

function getCookieNames(): string[] {
  return document.cookie
    .split(';')
    .map((part) => {
      const [name = ''] = part.split('=')

      return name.trim()
    })
    .filter(Boolean)
}

describe('getCookieDomainCandidates', () => {
  it('lists the host and every parent domain', () => {
    expect(getCookieDomainCandidates('swap.cow.fi')).toEqual(['swap.cow.fi', 'cow.fi'])
  })

  it('returns nothing for a single-label host', () => {
    expect(getCookieDomainCandidates('localhost')).toEqual([])
  })
})

describe('clearTrackerStorage', () => {
  beforeEach(() => {
    ;['_ga', '_ga_FC7FBG6T06', '_gcl_au', '_rdt_uuid', 'spdl_pid', '___adrsbl_nonce', 'first_utm_source'].forEach(
      (name) => {
        document.cookie = `${name}=1; Path=/`
      },
    )
    document.cookie = `${COOKIE_CONSENT_NAME}=keep; Path=/`
    document.cookie = 'theme=dark; Path=/'

    localStorage.setItem('spindl_persistent_id', '1')
    localStorage.setItem('____sfry_anonymous', '1')
    localStorage.setItem('___adrsbl_counter_', '1')
    localStorage.setItem('_gcl_ls', '1')
    localStorage.setItem('swapped_addresses', '[]')
    localStorage.setItem('favoriteTokensAtom:v2', '{}')
    sessionStorage.setItem('spindl_session_id', '1')
    sessionStorage.setItem('first_utm_tracking_sent', 'true')
    sessionStorage.setItem('other', '1')
  })

  afterEach(() => {
    getCookieNames().forEach((name) => {
      document.cookie = `${name}=; Max-Age=0; Path=/`
    })
    localStorage.clear()
    sessionStorage.clear()
  })

  it('removes tracker cookies and keeps the rest', () => {
    clearTrackerStorage()

    expect(getCookieNames().sort()).toEqual([COOKIE_CONSENT_NAME, 'theme'].sort())
  })

  it('removes tracker storage keys and keeps the rest', () => {
    clearTrackerStorage()

    expect(Object.keys(localStorage)).toEqual(['favoriteTokensAtom:v2'])
    expect(Object.keys(sessionStorage)).toEqual(['other'])
  })
})
