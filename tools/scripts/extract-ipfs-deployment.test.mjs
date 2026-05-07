import test from 'node:test'
import assert from 'node:assert/strict'

import { extractIpfsCid } from './extract-ipfs-deployment.mjs'

const cidV0 = 'QmYwAPJzv5CZsnAzt8auVZRn9DfVXjGkA4z7K34q4R9qyg'
const cidV1 = 'bafybeigdyrzt3sfp7udm7hu76jge2pe2bghlxve5jiijb2qlbtndk2nlky'

test('extracts CIDv0 from deployment output', () => {
  assert.equal(extractIpfsCid(`uploaded\n${cidV0}\n`), cidV0)
})

test('extracts CIDv1 from deployment output', () => {
  assert.equal(extractIpfsCid(`Gateway URL: https://ipfs.io/ipfs/${cidV1}/`), cidV1)
})

test('uses the last CID from noisy output', () => {
  assert.equal(extractIpfsCid(`previous ${cidV0}\ncurrent ${cidV1}`), cidV1)
})

test('returns null when output has no CID', () => {
  assert.equal(extractIpfsCid('deployment finished without a hash'), null)
})

test('does not match short bafy-like words', () => {
  assert.equal(extractIpfsCid('not a CID: bafytest'), null)
})
