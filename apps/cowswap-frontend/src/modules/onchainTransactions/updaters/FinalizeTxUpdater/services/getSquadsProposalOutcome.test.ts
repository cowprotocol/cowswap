import { PublicKey } from '@solana/web3.js'

import { getSquadsProposalOutcome } from './getSquadsProposalOutcome'

import type { AccountInfo, Connection } from '@solana/web3.js'

const SQUADS_V4_PROGRAM_ID = new PublicKey('SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf')
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
// `sha256("account:Proposal")[:8]`, verified against a live Squads v4 proposal account.
const PROPOSAL_DISCRIMINATOR = [26, 94, 189, 187, 116, 136, 53, 33]

const PROPOSAL = new PublicKey(new Uint8Array(32).fill(3))
const UNRELATED = new PublicKey(new Uint8Array(32).fill(4))

function buildAccount({
  tag,
  owner = SQUADS_V4_PROGRAM_ID,
  discriminator = PROPOSAL_DISCRIMINATOR,
}: {
  tag: number
  owner?: PublicKey
  discriminator?: number[]
}): AccountInfo<Buffer> {
  const data = Buffer.alloc(72)

  Buffer.from(discriminator).copy(data, 0)
  data[48] = tag

  return { owner, data, executable: false, lamports: 1, rentEpoch: 0 }
}

/** Each test uses its own signature: a resolved proposal address is memoised per signature. */
let signatureCounter = 0

function buildConnection(
  accounts: Array<AccountInfo<Buffer> | null>,
  keys: PublicKey[] = [UNRELATED, PROPOSAL],
): Connection {
  const byAddress = new Map(keys.map((key, i) => [key.toBase58(), accounts[i] ?? null]))

  return {
    getTransaction: jest.fn(async () =>
      keys.length ? { transaction: { message: { staticAccountKeys: keys } } } : null,
    ),
    getMultipleAccountsInfo: jest.fn(async () => accounts),
    getAccountInfo: jest.fn(async (address: PublicKey) => byAddress.get(address.toBase58()) ?? null),
  } as unknown as Connection
}

function nextSignature(): string {
  signatureCounter += 1

  return `signature-${signatureCounter}`
}

describe('getSquadsProposalOutcome', () => {
  it.each([
    ['rejected', 2],
    ['cancelled', 6],
  ])('gives up on the order when the proposal is %s', async (_label, tag) => {
    const connection = buildConnection([null, buildAccount({ tag })])

    await expect(getSquadsProposalOutcome(connection, nextSignature())).resolves.toBe('failed')
  })

  it('lets the order through when the proposal was executed', async () => {
    const connection = buildConnection([null, buildAccount({ tag: 5 })])

    await expect(getSquadsProposalOutcome(connection, nextSignature())).resolves.toBe('executed')
  })

  // Still awaiting votes — the order has not failed, so the caller must keep polling rather than
  // decide either way.
  it('keeps waiting while the proposal is still active', async () => {
    const connection = buildConnection([null, buildAccount({ tag: 1 })])

    await expect(getSquadsProposalOutcome(connection, nextSignature())).resolves.toBe('unresolved')
  })

  // Every one of these could be read as a verdict by a less careful implementation. Reading any of them
  // as `failed` would kill an order that is about to be executed.
  it.each([
    ['the status byte is one this code does not know', buildAccount({ tag: 99 })],
    ['the account belongs to another program', buildAccount({ tag: 2, owner: TOKEN_PROGRAM_ID })],
    ['the discriminator is not a Squads proposal', buildAccount({ tag: 2, discriminator: [1, 2, 3, 4, 5, 6, 7, 8] })],
    ['the account does not exist', null],
  ])('keeps waiting when %s', async (_label, account) => {
    const connection = buildConnection([null, account])

    await expect(getSquadsProposalOutcome(connection, nextSignature())).resolves.toBe('unresolved')
  })

  it('keeps waiting when the transaction cannot be found', async () => {
    const connection = buildConnection([], [])

    await expect(getSquadsProposalOutcome(connection, nextSignature())).resolves.toBe('unresolved')
  })

  it('looks the proposal up once and reuses it across polls', async () => {
    const connection = buildConnection([null, buildAccount({ tag: 1 })])
    const signature = nextSignature()

    await getSquadsProposalOutcome(connection, signature)
    await getSquadsProposalOutcome(connection, signature)

    expect(connection.getTransaction).toHaveBeenCalledTimes(1)
    expect(connection.getAccountInfo).toHaveBeenCalledTimes(2)
  })
})
