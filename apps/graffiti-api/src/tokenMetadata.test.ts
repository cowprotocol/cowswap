import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js'

import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  createMetadataInstruction,
  findMetadataPda,
  readUpdateAuthority,
  TOKEN_METADATA_PROGRAM_ID,
  updateMetadataInstruction,
  validateFields,
} from './tokenMetadata.js'

const MINT = new PublicKey('So11111111111111111111111111111111111111112')
const AUTHORITY = Keypair.generate().publicKey
const FIELDS = { name: 'GRASS', symbol: 'GRASS', uri: 'https://swap.cow.fi/token/grass.json' }

test('derives the metadata PDA from the canonical seeds', () => {
  const [expected] = PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), MINT.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID,
  )
  assert.equal(findMetadataPda(MINT).toBase58(), expected.toBase58())
})

test('create passes the metadata PDA, mint, authority thrice and the system program', () => {
  const ix = createMetadataInstruction({ ...FIELDS, mint: MINT, authority: AUTHORITY })

  assert.equal(ix.programId.toBase58(), TOKEN_METADATA_PROGRAM_ID.toBase58())
  assert.deepEqual(
    ix.keys.map((key) => key.pubkey.toBase58()),
    [
      findMetadataPda(MINT).toBase58(),
      MINT.toBase58(),
      AUTHORITY.toBase58(),
      AUTHORITY.toBase58(),
      AUTHORITY.toBase58(),
      SystemProgram.programId.toBase58(),
    ],
  )
  assert.deepEqual(
    ix.keys.map((key) => [key.isSigner, key.isWritable]),
    [
      [false, true],
      [false, false],
      [true, false],
      [true, true],
      [false, false],
      [false, false],
    ],
  )
})

test('create encodes DataV2 as variant 33 with Borsh strings and empty options', () => {
  const { data } = createMetadataInstruction({ ...FIELDS, mint: MINT, authority: AUTHORITY })

  let offset = 0
  assert.equal(data[offset++], 33)
  for (const value of [FIELDS.name, FIELDS.symbol, FIELDS.uri]) {
    assert.equal(data.readUInt32LE(offset), Buffer.byteLength(value, 'utf8'))
    offset += 4
    assert.equal(data.subarray(offset, offset + value.length).toString('utf8'), value)
    offset += value.length
  }
  assert.equal(data.readUInt16LE(offset), 0) // seller_fee_basis_points
  offset += 2
  // creators, collection, uses, then is_mutable = true and no collection_details
  assert.deepEqual(Array.from(data.subarray(offset)), [0, 0, 0, 1, 0])
})

test('update is variant 15 with only the data option set', () => {
  const ix = updateMetadataInstruction({ ...FIELDS, mint: MINT, updateAuthority: AUTHORITY })

  assert.equal(ix.data[0], 15)
  assert.equal(ix.data[1], 1)
  assert.deepEqual(Array.from(ix.data.subarray(ix.data.length - 3)), [0, 0, 0])
  assert.deepEqual(
    ix.keys.map((key) => [key.pubkey.toBase58(), key.isSigner, key.isWritable]),
    [
      [findMetadataPda(MINT).toBase58(), false, true],
      [AUTHORITY.toBase58(), true, false],
    ],
  )
})

test('reads the update authority from the byte after the account key', () => {
  const account = Buffer.concat([Buffer.from([4]), AUTHORITY.toBuffer(), Buffer.alloc(32)])
  assert.equal(readUpdateAuthority(account).toBase58(), AUTHORITY.toBase58())
})

test('accepts fields within the on-chain limits', () => {
  assert.equal(validateFields(FIELDS), null)
})

test('rejects fields the program would reject', () => {
  assert.match(validateFields({ ...FIELDS, name: 'x'.repeat(33) }) ?? '', /name is 33 bytes/)
  assert.match(validateFields({ ...FIELDS, symbol: 'x'.repeat(11) }) ?? '', /symbol is 11 bytes/)
  assert.match(validateFields({ ...FIELDS, uri: `https://x/${'y'.repeat(200)}` }) ?? '', /uri is 210 bytes/)
  assert.match(validateFields({ ...FIELDS, symbol: '' }) ?? '', /required/)
})
