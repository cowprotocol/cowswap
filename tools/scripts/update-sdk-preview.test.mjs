import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import test from 'node:test'

const { compareVersions } = createRequire(import.meta.url)('./update-sdk-preview.js')

test('compareVersions orders release versions', () => {
  assert.equal(compareVersions('0.2.0', '0.5.0'), -1)
  assert.equal(compareVersions('9.2.9', '9.2.8'), 1)
  assert.equal(compareVersions('1.4.2', '1.4.2'), 0)
  assert.equal(compareVersions('2.0.0', '10.0.0'), -1, 'compares numerically, not lexically')
})

// Mirrors warnAboutDowngrades: previewBase always comes from a `-pr-NNN` build, so an equal
// comparison still means the preview is behind the released version the workspace pins.
const isBehind = (previewBase, pin) => compareVersions(previewBase, pin) <= 0

test('a preview is behind when its base is lower', () => {
  assert.equal(isBehind('0.2.0', '0.5.0'), true, 'sdk-trading-solana regression that broke the build')
})

test('a preview is behind when its base equals the pinned release', () => {
  assert.equal(isBehind('9.2.9', '9.2.9'), true, '9.2.9-pr-1008 sorts before released 9.2.9')
})

test('a preview ahead of the pin is not flagged', () => {
  assert.equal(isBehind('9.3.0', '9.2.9'), false)
})
