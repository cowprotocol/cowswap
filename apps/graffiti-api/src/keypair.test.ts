import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { parseSecretKey, readSecretKeyFile } from './keypair.js'

const KEYPAIR = Keypair.generate()
const BYTE_ARRAY = JSON.stringify(Array.from(KEYPAIR.secretKey))
const BASE58 = bs58.encode(KEYPAIR.secretKey)

test('parses a JSON byte array', () => {
  assert.equal(parseSecretKey(BYTE_ARRAY)?.publicKey.toBase58(), KEYPAIR.publicKey.toBase58())
})

test('parses a base58 secret key', () => {
  assert.equal(parseSecretKey(BASE58)?.publicKey.toBase58(), KEYPAIR.publicKey.toBase58())
})

test('tolerates surrounding whitespace, as a shell heredoc or file leaves', () => {
  assert.equal(parseSecretKey(`\n  ${BYTE_ARRAY}\n`)?.publicKey.toBase58(), KEYPAIR.publicKey.toBase58())
  assert.equal(parseSecretKey(` ${BASE58} `)?.publicKey.toBase58(), KEYPAIR.publicKey.toBase58())
})

test('returns null for malformed input', () => {
  for (const raw of ['', 'not-a-key', '[1,2,3]', '[]', JSON.stringify(Array(64).fill(0))]) {
    assert.equal(parseSecretKey(raw), null, `expected null for ${JSON.stringify(raw)}`)
  }
})

test('readSecretKeyFile reads either encoding and returns null when absent', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'graffiti-keys-'))
  try {
    const arrayFile = path.join(dir, 'array.json')
    const base58File = path.join(dir, 'base58.txt')
    fs.writeFileSync(arrayFile, BYTE_ARRAY)
    fs.writeFileSync(base58File, `${BASE58}\n`)

    assert.equal(readSecretKeyFile(arrayFile)?.publicKey.toBase58(), KEYPAIR.publicKey.toBase58())
    assert.equal(readSecretKeyFile(base58File)?.publicKey.toBase58(), KEYPAIR.publicKey.toBase58())
    assert.equal(readSecretKeyFile(path.join(dir, 'missing.json')), null)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})
