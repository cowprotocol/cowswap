import assert from 'node:assert/strict'
import { test } from 'node:test'

import { assertValidRegistry } from './registryValidation.mjs'

const ASSET = {
  ticker: 'NVDA',
  coingeckoId: 'nvidia',
  title: 'NVIDIA',
  type: 'stock',
  priority: 1,
  profile: { description: 'NVIDIA designs GPUs.', sector: 'Information Technology · Semiconductors' },
  tokens: [
    {
      chainId: 1,
      address: '0x2D1F7226Bd1F780AF6B9A49DCC0aE00E8Df4bDEE',
      symbol: 'NVDAon',
      name: 'NVIDIA (Ondo Tokenized)',
      decimals: 18,
      issuer: 'Ondo',
    },
  ],
}

function registryWith(assets) {
  return { version: '0.1.0', lastModificationTime: '2026-09-28T00:00:00.000Z', assets }
}

test('assertValidRegistry accepts a valid registry', () => {
  assert.doesNotThrow(() => assertValidRegistry(registryWith([ASSET])))
})

test('assertValidRegistry throws with every error', () => {
  const invalid = { ...ASSET, title: '', profile: { ...ASSET.profile, description: 'See nvidia-claim.xyz.' } }

  assert.throws(
    () => assertValidRegistry(registryWith([invalid])),
    new Error(
      'Invalid registry (2 errors):\nassets[0].title: required\nassets[0].profile.description: must not contain links or domains',
    ),
  )
})
