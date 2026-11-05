import { findRwaDescriptionIssue, RWA_DESCRIPTION_MAX_LENGTH } from './description'

describe('findRwaDescriptionIssue', () => {
  it('accepts plain text, abbreviations and domains from the title', () => {
    expect(findRwaDescriptionIssue('Apple Inc. sells phones in the U.S. and abroad, e.g. the iPhone.', 'Apple')).toBe(
      null,
    )
    expect(findRwaDescriptionIssue('Kaspi.kz runs a marketplace.', 'Kaspi.kz JSC')).toBe(null)
    expect(findRwaDescriptionIssue('a'.repeat(RWA_DESCRIPTION_MAX_LENGTH), 'X')).toBe(null)
  })

  it('rejects long text', () => {
    expect(findRwaDescriptionIssue('a'.repeat(RWA_DESCRIPTION_MAX_LENGTH + 1), 'X')).toBe(
      'must be at most 2000 characters',
    )
  })

  it.each(['<img src=x onerror=alert(1)>', 'A </script> B', 'A {x} B', 'A `x` B'])(
    'rejects markup characters in %j',
    (description) => {
      expect(findRwaDescriptionIssue(description, 'X')).toBe('must not contain <, >, {, } or `')
    },
  )

  it.each(['A\nB', 'A\u0000B', 'A‮B', 'A​B', 'A﻿B'])(
    'rejects control and invisible characters in %j',
    (description) => {
      expect(findRwaDescriptionIssue(description, 'X')).toBe('must not contain control or invisible characters')
    },
  )

  it.each([
    'Claim tokens at https://example.com now.',
    'Visit www.example.org.',
    'Migrate at cow-claim.xyz today.',
    'Trading moved to Kaspi.kz.evil.io.',
    'Write to support@example.com.',
  ])('rejects links and domains that are not in the title in %j', (description) => {
    expect(findRwaDescriptionIssue(description, 'Kaspi.kz JSC')).toBe('must not contain links or domains')
  })
})
