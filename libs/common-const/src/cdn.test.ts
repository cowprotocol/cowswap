const SOLANA_LIST_URLS = ['SOLANA_TOKEN_LIST_URL', 'SOLANA_RWA_TOKEN_LIST_URL'] as const

function importCdn(cowCdn: string | undefined): Record<string, string> {
  jest.resetModules()

  if (cowCdn === undefined) {
    delete process.env['REACT_APP_COW_CDN']
  } else {
    process.env['REACT_APP_COW_CDN'] = cowCdn
  }

  return jest.requireActual('./cdn')
}

describe('Solana token list URLs', () => {
  const originalCowCdn = process.env['REACT_APP_COW_CDN']

  afterEach(() => {
    if (originalCowCdn === undefined) {
      delete process.env['REACT_APP_COW_CDN']
    } else {
      process.env['REACT_APP_COW_CDN'] = originalCowCdn
    }
  })

  /**
   * `tokensList.json` spells these URLs out and cannot interpolate an env var, while geoblocking matches a
   * list by its URL. If these followed `COW_CDN`, an override would move only this copy and the configured
   * list would quietly stop being restricted.
   */
  it('ignore a REACT_APP_COW_CDN override', () => {
    const defaults = importCdn(undefined)
    const overridden = importCdn('https://cdn.example.com')

    expect(overridden['COW_CDN']).toBe('https://cdn.example.com')

    SOLANA_LIST_URLS.forEach((name) => {
      expect(overridden[name]).toBe(defaults[name])
      expect(overridden[name]).toMatch(/^https:\/\/files\.cow\.fi\/token-lists\//)
    })
  })
})
