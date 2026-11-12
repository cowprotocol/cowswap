import { PublicKey } from '@solana/web3.js'

import { getSquadsProposalOutcome } from './getSquadsProposalOutcome'

import type { AccountInfo, Connection } from '@solana/web3.js'

const SQUADS_PROGRAM_ID = new PublicKey('SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf')
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')

const VAULT_TRANSACTION_DISCRIMINATOR = [168, 250, 162, 100, 81, 14, 162, 207]
/** Another Squads account that sits in the same filing — a decoder alone would not tell them apart. */
const MULTISIG_DISCRIMINATOR = [224, 116, 121, 186, 68, 161, 79, 236]

const MULTISIG = new PublicKey(new Uint8Array(32).fill(5))
const PROPOSAL_ADDRESS = new PublicKey(new Uint8Array(32).fill(7))
const TRANSACTION_INDEX = 14

const mockGetProposalPda = jest.fn()
const mockDecodeVaultTransaction = jest.fn()
const mockDecodeProposal = jest.fn()

jest.mock('@sqds/multisig', () => ({
  PROGRAM_ID: new (jest.requireActual('@solana/web3.js').PublicKey)('SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf'),
  getProposalPda: (...args: unknown[]) => mockGetProposalPda(...args),
  accounts: {
    vaultTransactionDiscriminator: [168, 250, 162, 100, 81, 14, 162, 207],
    Proposal: { fromAccountInfo: (...args: unknown[]) => mockDecodeProposal(...args) },
    VaultTransaction: { fromAccountInfo: (...args: unknown[]) => mockDecodeVaultTransaction(...args) },
  },
}))

function buildAccount(discriminator: number[], owner = SQUADS_PROGRAM_ID): AccountInfo<Buffer> {
  const data = Buffer.alloc(120)

  Buffer.from(discriminator).copy(data, 0)

  return { owner, data, executable: false, lamports: 1, rentEpoch: 0 }
}

function buildConnection({
  filing = [buildAccount(MULTISIG_DISCRIMINATOR), buildAccount(VAULT_TRANSACTION_DISCRIMINATOR)],
  proposal = null,
  hasTransaction = true,
  staticKeyCount = 2,
}: {
  filing?: Array<AccountInfo<Buffer> | null>
  proposal?: AccountInfo<Buffer> | null
  hasTransaction?: boolean
  /** Keys the message carries itself; the rest are treated as supplied by a lookup table. */
  staticKeyCount?: number
} = {}): Connection {
  // Distinct keys, and the lookup answers by key — otherwise a test cannot tell whether the code
  // actually asked for the account it needed.
  const keys = filing.map((_, index) => new PublicKey(new Uint8Array(32).fill(index + 11)))
  const byKey = new Map(keys.map((key, index) => [key.toBase58(), filing[index] ?? null]))

  return {
    getTransaction: jest.fn(async () =>
      hasTransaction
        ? {
            transaction: { message: { staticAccountKeys: keys.slice(0, staticKeyCount) } },
            meta: { loadedAddresses: { writable: keys.slice(staticKeyCount), readonly: [] } },
          }
        : null,
    ),
    getMultipleAccountsInfo: jest.fn(async (requested: PublicKey[]) =>
      requested.map((key) => byKey.get(key.toBase58()) ?? null),
    ),
    getAccountInfo: jest.fn(async () => proposal),
  } as unknown as Connection
}

/** Each test needs its own signature: a derived proposal address is memoised per signature. */
let signatureCounter = 0

function nextSignature(): string {
  signatureCounter += 1

  return `signature-${signatureCounter}`
}

function setProposalStatus(kind: string): void {
  mockDecodeProposal.mockImplementation(() => [{ status: { __kind: kind } }])
}

beforeEach(() => {
  jest.clearAllMocks()
  mockGetProposalPda.mockReturnValue([PROPOSAL_ADDRESS, 254])
  // Deliberately never throws: identification must rest on the discriminator, not on a decode failure.
  mockDecodeVaultTransaction.mockReturnValue([{ multisig: MULTISIG, index: TRANSACTION_INDEX }])
  setProposalStatus('Active')
})

describe('getSquadsProposalOutcome', () => {
  // The filing the wallet broadcasts creates a `VaultTransaction` only. The `Proposal` carrying the vote
  // is written later, by a transaction this code never sees, so it has to be derived.
  it('derives the proposal from the vault transaction rather than the filing accounts', async () => {
    const connection = buildConnection({ proposal: buildAccount([]) })

    await getSquadsProposalOutcome(connection, nextSignature())

    expect(mockGetProposalPda).toHaveBeenCalledWith({
      multisigPda: MULTISIG,
      transactionIndex: BigInt(TRANSACTION_INDEX),
    })
    expect(connection.getAccountInfo).toHaveBeenCalledWith(PROPOSAL_ADDRESS)
  })

  // The SDK's decoder reads the discriminator as a plain field and never compares it, so every Squads
  // account in the filing decodes "successfully". Picking the wrong one caches a bogus address for the
  // signature, and every later poll reads an empty account — the order waits out a rejection forever.
  it('ignores other squads accounts in the filing, even when they decode cleanly', async () => {
    const connection = buildConnection({
      filing: [buildAccount(MULTISIG_DISCRIMINATOR), buildAccount(MULTISIG_DISCRIMINATOR)],
    })

    await expect(getSquadsProposalOutcome(connection, nextSignature())).resolves.toBe('unresolved')
    expect(mockGetProposalPda).not.toHaveBeenCalled()
  })

  // `staticAccountKeys` omits whatever an address lookup table supplied, and Squads does not require
  // the vault transaction to be static. Missing it leaves the order waiting out a rejection forever.
  it('finds a vault transaction supplied by an address lookup table', async () => {
    const connection = buildConnection({
      filing: [buildAccount(MULTISIG_DISCRIMINATOR), buildAccount(VAULT_TRANSACTION_DISCRIMINATOR)],
      staticKeyCount: 1,
      proposal: buildAccount([]),
    })

    await getSquadsProposalOutcome(connection, nextSignature())

    expect(mockGetProposalPda).toHaveBeenCalledWith({
      multisigPda: MULTISIG,
      transactionIndex: BigInt(TRANSACTION_INDEX),
    })
  })

  it('ignores an account with the right discriminator owned by another program', async () => {
    const connection = buildConnection({
      filing: [null, buildAccount(VAULT_TRANSACTION_DISCRIMINATOR, TOKEN_PROGRAM_ID)],
    })

    await expect(getSquadsProposalOutcome(connection, nextSignature())).resolves.toBe('unresolved')
    expect(mockGetProposalPda).not.toHaveBeenCalled()
  })

  it.each([['Rejected'], ['Cancelled']])('gives up on the order when the proposal is %s', async (kind) => {
    setProposalStatus(kind)

    const connection = buildConnection({ proposal: buildAccount([]) })

    await expect(getSquadsProposalOutcome(connection, nextSignature())).resolves.toBe('failed')
  })

  it('lets the order through when the proposal was executed', async () => {
    setProposalStatus('Executed')

    const connection = buildConnection({ proposal: buildAccount([]) })

    await expect(getSquadsProposalOutcome(connection, nextSignature())).resolves.toBe('executed')
  })

  // Each of these could be read as a verdict by a less careful implementation. Reading any as `failed`
  // would kill an order that is about to be executed.
  it.each([
    ['the members have not voted yet, so no proposal exists', { proposal: null }],
    ['the filing holds no accounts at all', { filing: [null, null] }],
    ['the transaction cannot be found', { hasTransaction: false }],
  ])('keeps waiting when %s', async (_label, overrides) => {
    const connection = buildConnection(overrides)

    await expect(getSquadsProposalOutcome(connection, nextSignature())).resolves.toBe('unresolved')
  })

  it('keeps waiting when the proposal status is one this code does not know', async () => {
    setProposalStatus('Draft')

    const connection = buildConnection({ proposal: buildAccount([]) })

    await expect(getSquadsProposalOutcome(connection, nextSignature())).resolves.toBe('unresolved')
  })

  it('keeps waiting when the proposal cannot be decoded', async () => {
    mockDecodeProposal.mockImplementation(() => {
      throw new Error('not a proposal')
    })

    const connection = buildConnection({ proposal: buildAccount([]) })

    await expect(getSquadsProposalOutcome(connection, nextSignature())).resolves.toBe('unresolved')
  })

  it('derives the proposal once and reuses it across polls', async () => {
    const connection = buildConnection({ proposal: buildAccount([]) })
    const signature = nextSignature()

    await getSquadsProposalOutcome(connection, signature)
    await getSquadsProposalOutcome(connection, signature)

    expect(connection.getTransaction).toHaveBeenCalledTimes(1)
    expect(mockGetProposalPda).toHaveBeenCalledTimes(1)
    expect(connection.getAccountInfo).toHaveBeenCalledTimes(2)
  })
})
