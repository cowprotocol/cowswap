/**
 * @jest-environment node
 */
import { Keypair, PublicKey } from '@solana/web3.js'

import { getSquadsProposalOutcome } from './getSquadsProposalOutcome'

import type { AccountInfo, Connection } from '@solana/web3.js'

const SQUADS_V4_PROGRAM_ID = new PublicKey('SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf')
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')

const PROPOSAL_DISCRIMINATOR = [26, 94, 189, 187, 116, 136, 53, 33]
const VAULT_TRANSACTION_DISCRIMINATOR = [168, 250, 162, 100, 81, 14, 162, 207]

const MULTISIG = Keypair.generate().publicKey
const TRANSACTION_INDEX = 14n
const VAULT_TRANSACTION_ADDRESS = Keypair.generate().publicKey
const UNRELATED_ADDRESS = Keypair.generate().publicKey

/** The address the Squads program itself would derive — the whole point of the lookup under test. */
const EXPECTED_PROPOSAL = derive(['multisig', MULTISIG, 'transaction', TRANSACTION_INDEX, 'proposal'])

function buildAccount(discriminator: number[], tagOffset: number, tag: number, owner: PublicKey): AccountInfo<Buffer> {
  const data = Buffer.alloc(120)

  Buffer.from(discriminator).copy(data, 0)
  data[tagOffset] = tag

  return { owner, data, executable: false, lamports: 1, rentEpoch: 0 }
}

function buildConnection({
  vaultTransaction = buildVaultTransaction(),
  proposal = null,
  keys = [UNRELATED_ADDRESS, VAULT_TRANSACTION_ADDRESS],
}: {
  vaultTransaction?: AccountInfo<Buffer> | null
  proposal?: AccountInfo<Buffer> | null
  keys?: PublicKey[]
} = {}): Connection {
  return {
    getTransaction: jest.fn(async () =>
      keys.length ? { transaction: { message: { staticAccountKeys: keys } } } : null,
    ),
    getMultipleAccountsInfo: jest.fn(async () => [null, vaultTransaction]),
    getAccountInfo: jest.fn(async (address: PublicKey) => (address.equals(EXPECTED_PROPOSAL) ? proposal : null)),
  } as unknown as Connection
}

function buildProposal(tag: number, owner = SQUADS_V4_PROGRAM_ID): AccountInfo<Buffer> {
  return buildAccount(PROPOSAL_DISCRIMINATOR, 48, tag, owner)
}

function buildVaultTransaction({
  owner = SQUADS_V4_PROGRAM_ID,
  discriminator = VAULT_TRANSACTION_DISCRIMINATOR,
}: { owner?: PublicKey; discriminator?: number[] } = {}): AccountInfo<Buffer> {
  const account = buildAccount(discriminator, 0, discriminator[0], owner)

  MULTISIG.toBuffer().copy(account.data, 8)
  account.data.writeBigUInt64LE(TRANSACTION_INDEX, 72)

  return account
}

function derive(parts: Array<string | PublicKey | bigint>): PublicKey {
  const seeds = parts.map((part) => {
    if (typeof part === 'string') return Buffer.from(part)
    if (typeof part === 'bigint') {
      const index = Buffer.alloc(8)

      index.writeBigUInt64LE(part)

      return index
    }

    return part.toBuffer()
  })

  return PublicKey.findProgramAddressSync(seeds, SQUADS_V4_PROGRAM_ID)[0]
}

/** Each test needs its own signature: a derived proposal address is memoised per signature. */
let signatureCounter = 0

function nextSignature(): string {
  signatureCounter += 1

  return `signature-${signatureCounter}`
}

describe('getSquadsProposalOutcome', () => {
  // The filing the wallet broadcasts creates a `VaultTransaction` only. The `Proposal` carrying the vote
  // is written later, by a transaction this code never sees, so it has to be derived.
  it('derives the proposal from the vault transaction rather than the filing accounts', async () => {
    const connection = buildConnection({ proposal: buildProposal(1) })

    await getSquadsProposalOutcome(connection, nextSignature())

    expect(connection.getAccountInfo).toHaveBeenCalledWith(EXPECTED_PROPOSAL)
  })

  it.each([
    ['rejected', 2],
    ['cancelled', 6],
  ])('gives up on the order when the proposal is %s', async (_label, tag) => {
    const connection = buildConnection({ proposal: buildProposal(tag) })

    await expect(getSquadsProposalOutcome(connection, nextSignature())).resolves.toBe('failed')
  })

  it('lets the order through when the proposal was executed', async () => {
    const connection = buildConnection({ proposal: buildProposal(5) })

    await expect(getSquadsProposalOutcome(connection, nextSignature())).resolves.toBe('executed')
  })

  // Each of these could be read as a verdict by a less careful implementation. Reading any as `failed`
  // would kill an order that is about to be executed.
  it.each([
    ['the members have not voted yet, so no proposal exists', { proposal: null }],
    ['the proposal status is one this code does not know', { proposal: buildProposal(99) }],
    ['the proposal belongs to another program', { proposal: buildProposal(2, TOKEN_PROGRAM_ID) }],
    ['the filing holds no vault transaction', { vaultTransaction: null }],
    [
      'the vault transaction belongs to another program',
      { vaultTransaction: buildVaultTransaction({ owner: TOKEN_PROGRAM_ID }) },
    ],
    [
      'the vault transaction discriminator does not match',
      { vaultTransaction: buildVaultTransaction({ discriminator: [1, 2, 3, 4, 5, 6, 7, 8] }) },
    ],
    ['the transaction cannot be found', { keys: [] }],
  ])('keeps waiting when %s', async (_label, overrides) => {
    const connection = buildConnection(overrides)

    await expect(getSquadsProposalOutcome(connection, nextSignature())).resolves.toBe('unresolved')
  })

  it('derives the proposal once and reuses it across polls', async () => {
    const connection = buildConnection({ proposal: buildProposal(1) })
    const signature = nextSignature()

    await getSquadsProposalOutcome(connection, signature)
    await getSquadsProposalOutcome(connection, signature)

    expect(connection.getTransaction).toHaveBeenCalledTimes(1)
    expect(connection.getAccountInfo).toHaveBeenCalledTimes(2)
  })
})
