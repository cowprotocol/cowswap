import { getBackendEnv, getPageBackendEnv } from './backendEnv'

describe('getBackendEnv', () => {
  it.each(['swap.cow.fi', 'staging.swap.cow.fi'])('is prod on %s', (hostname) => {
    expect(getBackendEnv(hostname)).toBe('prod')
  })

  it.each(['dev.swap.cow.fi', 'rwa-git-feat-cowswap-dev.vercel.app', 'localhost', 'swap.cow.fi.evil.com', undefined])(
    'is barn on %s',
    (hostname) => {
      expect(getBackendEnv(hostname)).toBe('staging')
    },
  )
})

describe('getPageBackendEnv', () => {
  it('reads the page host', () => {
    expect(getPageBackendEnv()).toBe('staging')
  })
})
