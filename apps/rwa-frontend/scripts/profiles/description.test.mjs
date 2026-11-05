import assert from 'node:assert/strict'
import { test } from 'node:test'

import { DESCRIPTION_MAX_LENGTH, findDescriptionIssue } from './description.mjs'

test('findDescriptionIssue accepts plain text, abbreviations and domains from the title', () => {
  assert.equal(findDescriptionIssue('Apple Inc. sells phones in the U.S. and abroad, e.g. the iPhone.', 'Apple'), null)
  assert.equal(findDescriptionIssue('Trip.com Group runs Trip.com and Ctrip.', 'Trip.com Group'), null)
  assert.equal(findDescriptionIssue('BigBear.ai provides analytics.', 'BigBear.ai Holdings'), null)
  assert.equal(findDescriptionIssue('a'.repeat(DESCRIPTION_MAX_LENGTH), 'X'), null)
})

test('findDescriptionIssue rejects long text', () => {
  assert.equal(findDescriptionIssue('a'.repeat(DESCRIPTION_MAX_LENGTH + 1), 'X'), 'must be at most 2000 characters')
})

test('findDescriptionIssue rejects markup characters', () => {
  for (const description of ['<img src=x onerror=alert(1)>', 'A </script> B', 'A {x} B', 'A `x` B']) {
    assert.equal(findDescriptionIssue(description, 'X'), 'must not contain <, >, {, } or `', description)
  }
})

test('findDescriptionIssue rejects control and invisible characters', () => {
  for (const description of ['A\nB', 'A\u0000B', 'A‮B', 'A​B', 'A﻿B']) {
    assert.equal(
      findDescriptionIssue(description, 'X'),
      'must not contain control or invisible characters',
      JSON.stringify(description),
    )
  }
})

test('findDescriptionIssue rejects links and domains that are not in the title', () => {
  for (const description of [
    'Claim tokens at https://example.com now.',
    'Visit www.example.org.',
    'Migrate at cow-claim.xyz today.',
    'Trading moved to Trip.com.evil.io.',
    'Write to support@example.com.',
  ]) {
    assert.equal(findDescriptionIssue(description, 'Trip.com Group'), 'must not contain links or domains', description)
  }
})
