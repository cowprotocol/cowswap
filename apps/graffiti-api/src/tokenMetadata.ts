/**
 * Metaplex Token Metadata instructions, hand-encoded.
 *
 * The wall's mint is a classic SPL mint with no metadata, so wallets show it as
 * UNKNOWN. Attaching a metadata PDA is what gives it a name, a symbol and a logo.
 * The program's instruction set is a Borsh enum: the leading byte is the variant
 * index (33 = CreateMetadataAccountV3, 15 = UpdateMetadataAccountV2), and every
 * `Option<T>` is a 0/1 byte followed by T when present.
 */
import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js'

export const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

/** Fixed account size the program allocates, hence the rent a create costs. */
export const METADATA_ACCOUNT_SIZE = 679

/** On-chain field limits; the program rejects anything longer. */
export const MAX_NAME_LENGTH = 32
export const MAX_SYMBOL_LENGTH = 10
export const MAX_URI_LENGTH = 200

const CREATE_METADATA_ACCOUNT_V3 = 33
const UPDATE_METADATA_ACCOUNT_V2 = 15
const NONE = 0
const SOME = 1

/** `update_authority` sits right after the 1-byte account key discriminator. */
const UPDATE_AUTHORITY_OFFSET = 1

export interface CreateMetadataParams extends TokenMetadataFields {
  mint: PublicKey
  /** Must be the mint authority; also pays rent and becomes the update authority. */
  authority: PublicKey
}

export interface TokenMetadataFields {
  name: string
  symbol: string
  uri: string
}

export interface UpdateMetadataParams extends TokenMetadataFields {
  mint: PublicKey
  updateAuthority: PublicKey
}

export function createMetadataInstruction(params: CreateMetadataParams): TransactionInstruction {
  const data = Buffer.concat([
    Buffer.from([CREATE_METADATA_ACCOUNT_V3]),
    encodeDataV2(params),
    Buffer.from([SOME]), // is_mutable: keep it editable so a logo can be fixed later
    Buffer.from([NONE]), // collection_details
  ])

  return new TransactionInstruction({
    programId: TOKEN_METADATA_PROGRAM_ID,
    keys: [
      { pubkey: findMetadataPda(params.mint), isSigner: false, isWritable: true },
      { pubkey: params.mint, isSigner: false, isWritable: false },
      { pubkey: params.authority, isSigner: true, isWritable: false }, // mint authority
      { pubkey: params.authority, isSigner: true, isWritable: true }, // payer
      { pubkey: params.authority, isSigner: false, isWritable: false }, // update authority
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  })
}

export function findMetadataPda(mint: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID,
  )
  return pda
}

/** Who may change an existing metadata account, read straight off its raw bytes. */
export function readUpdateAuthority(account: Buffer): PublicKey {
  return new PublicKey(account.subarray(UPDATE_AUTHORITY_OFFSET, UPDATE_AUTHORITY_OFFSET + 32))
}

export function updateMetadataInstruction(params: UpdateMetadataParams): TransactionInstruction {
  const data = Buffer.concat([
    Buffer.from([UPDATE_METADATA_ACCOUNT_V2]),
    Buffer.from([SOME]),
    encodeDataV2(params),
    Buffer.from([NONE]), // new_update_authority
    Buffer.from([NONE]), // primary_sale_happened
    Buffer.from([NONE]), // is_mutable
  ])

  return new TransactionInstruction({
    programId: TOKEN_METADATA_PROGRAM_ID,
    keys: [
      { pubkey: findMetadataPda(params.mint), isSigner: false, isWritable: true },
      { pubkey: params.updateAuthority, isSigner: true, isWritable: false },
    ],
    data,
  })
}

/** The reason the fields are unusable on-chain, or null when they fit. */
export function validateFields(fields: TokenMetadataFields): string | null {
  const tooLong = (
    [
      ['name', fields.name, MAX_NAME_LENGTH],
      ['symbol', fields.symbol, MAX_SYMBOL_LENGTH],
      ['uri', fields.uri, MAX_URI_LENGTH],
    ] as const
  ).find(([, value, max]) => Buffer.byteLength(value, 'utf8') > max)

  if (tooLong) return `${tooLong[0]} is ${Buffer.byteLength(tooLong[1], 'utf8')} bytes; the limit is ${tooLong[2]}`
  if (!fields.name || !fields.symbol) return 'name and symbol are required'
  return null
}

/** DataV2: name, symbol, uri, seller fee, then three empty options. */
function encodeDataV2(fields: TokenMetadataFields): Buffer {
  const sellerFee = Buffer.alloc(2)
  sellerFee.writeUInt16LE(0, 0)

  return Buffer.concat([
    encodeString(fields.name),
    encodeString(fields.symbol),
    encodeString(fields.uri),
    sellerFee,
    Buffer.from([NONE]), // creators
    Buffer.from([NONE]), // collection
    Buffer.from([NONE]), // uses
  ])
}

/** Borsh string: u32 little-endian byte length, then the UTF-8 bytes. */
function encodeString(value: string): Buffer {
  const bytes = Buffer.from(value, 'utf8')
  const length = Buffer.alloc(4)
  length.writeUInt32LE(bytes.length, 0)
  return Buffer.concat([length, bytes])
}
