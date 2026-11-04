import { PublicKey } from '@solana/web3.js'

import { getSquadsProposalOutcome } from './getSquadsProposalOutcome'

import type { AccountInfo, Connection } from '@solana/web3.js'

const MULTISIG = new PublicKey(new Uint8Array(32).fill(5))
const PROPOSAL_ADDRESS = new PublicKey(new Uint8Array(32).fill(7))
const TRANSACTION_INDEX = 14

/** First data byte marks what the SDK would decode the account as, so the mocks can act like it. */
const VAULT_TRANSACTION = 1
const PROPOSAL = 2

const mockGetProposalPda = jest.fn()
const mockDecodeVaultTransaction = jest.fn()
const mockDecodeProposal = jest.fn()

jest.mock('@sqds/multisig', () => ({
  getProposalPda: (...args: unknown[]) => mockGetProposalPda(...args),
  accounts: {
    Proposal: { fromAccountInfo: (...args: unknown[]) => mockDecodeProposal(...args) },
    VaultTransaction: { fromAccountInfo: (...args: unknown[]) => mockDecodeVaultTransaction(...args) },
  },
}))

function buildAccount(kind: number): AccountInfo<Buffer> {
  const data = Buffer.alloc(8)

  data[0] = kind

  return { owner: MULTISIG, data, executable: false, lamports: 1, rentEpoch: 0 }
}

function buildConnection({
  filing = [buildAccount(0), buildAccount(VAULT_TRANSACTION)],
  proposal = null,
  keys = [PROPOSAL_ADDRESS, PROPOSAL_ADDRESS],
}: {
  filing?: Array<AccountInfo<Buffer> | null>
  proposal?: AccountInfo<Buffer> | null
  keys?: PublicKey[]
} = {}): Connection {
  return {
    getTransaction: jest.fn(async () =>
      keys.length ? { transaction: { message: { staticAccountKeys: keys } } } : null,
    ),
    getMultipleAccountsInfo: jest.fn(async () => filing),
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
  mockDecodeProposal.mockImplementation((account: AccountInfo<Buffer>) => {
    if (account.data[0] !== PROPOSAL) throw new Error('not a proposal account')

    return [{ status: { __kind: kind } }]
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockGetProposalPda.mockReturnValue([PROPOSAL_ADDRESS, 254])
  mockDecodeVaultTransaction.mockImplementation((account: AccountInfo<Buffer>) => {
    if (account.data[0] !== VAULT_TRANSACTION) throw new Error('not a vault transaction account')

    return [{ multisig: MULTISIG, index: TRANSACTION_INDEX }]
  })
  setProposalStatus('Active')
})

describe('getSquadsProposalOutcome', () => {
  // The filing the wallet broadcasts creates a `VaultTransaction` only. The `Proposal` carrying the vote
  // is written later, by a transaction this code never sees, so it has to be derived.
  it('derives the proposal from the vault transaction rather than the filing accounts', async () => {
    const connection = buildConnection({ proposal: buildAccount(PROPOSAL) })

    await getSquadsProposalOutcome(connection, nextSignature())

    expect(mockGetProposalPda).toHaveBeenCalledWith({
      multisigPda: MULTISIG,
      transactionIndex: BigInt(TRANSACTION_INDEX),
    })
    expect(connection.getAccountInfo).toHaveBeenCalledWith(PROPOSAL_ADDRESS)
  })

  it.each([['Rejected'], ['Cancelled']])('gives up on the order when the proposal is %s', async (kind) => {
    setProposalStatus(kind)

    const connection = buildConnection({ proposal: buildAccount(PROPOSAL) })

    await expect(getSquadsProposalOutcome(connection, nextSignature())).resolves.toBe('failed')
  })

  it('lets the order through when the proposal was executed', async () => {
    setProposalStatus('Executed')

    const connection = buildConnection({ proposal: buildAccount(PROPOSAL) })

    await expect(getSquadsProposalOutcome(connection, nextSignature())).resolves.toBe('executed')
  })

  // Each of these could be read as a verdict by a less careful implementation. Reading any as `failed`
  // would kill an order that is about to be executed.
  it.each([
    ['the members have not voted yet, so no proposal exists', { proposal: null }],
    ['the proposal is still awaiting votes', { proposal: buildAccount(PROPOSAL) }],
    ['the proposal cannot be decoded', { proposal: buildAccount(0) }],
    ['the filing holds no vault transaction', { filing: [buildAccount(0), buildAccount(0)] }],
    ['the filing holds no accounts at all', { filing: [null, null] }],
    ['the transaction cannot be found', { keys: [] }],
  ])('keeps waiting when %s', async (_label, overrides) => {
    const connection = buildConnection(overrides)

    await expect(getSquadsProposalOutcome(connection, nextSignature())).resolves.toBe('unresolved')
  })

  it('derives the proposal once and reuses it across polls', async () => {
    const connection = buildConnection({ proposal: buildAccount(PROPOSAL) })
    const signature = nextSignature()

    await getSquadsProposalOutcome(connection, signature)
    await getSquadsProposalOutcome(connection, signature)

    expect(connection.getTransaction).toHaveBeenCalledTimes(1)
    expect(mockGetProposalPda).toHaveBeenCalledTimes(1)
    expect(connection.getAccountInfo).toHaveBeenCalledTimes(2)
  })
})
