/**
 * PublicKey.isOnCurve misreports every point as on-curve under jsdom, exhausting findProgramAddressSync's bumps.
 * @jest-environment node
 */
import { ENCODED_ORDER_ACCOUNT_SIZE } from '@cowprotocol/sdk-trading-solana'

import { Connection, PublicKey } from '@solana/web3.js'

import { buildSolanaReclaimOrderParams } from './buildSolanaReclaimOrderParams'

const owner = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')
const sponsor = new PublicKey('So11111111111111111111111111111111111111112')
const idA = '0x1f2a3b4c5d6e7f809192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f'
const idB = '0x2f2a3b4c5d6e7f809192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f'
const SETTLED = Date.now() - 60 * 60 * 1000
const JUST_PLACED = Date.now()

function accountInfo({ createdBy, cancelled }: { createdBy: PublicKey; cancelled: boolean }): { data: Buffer } {
  const data = Buffer.alloc(ENCODED_ORDER_ACCOUNT_SIZE)

  data[0] = 0x80
  data[2] = cancelled ? 1 : 0
  data.set(createdBy.toBytes(), 19)

  return { data }
}

function makeConnection(accounts: Array<object | null>): Connection {
  return { getMultipleAccountsInfo: jest.fn().mockResolvedValue(accounts) } as unknown as Connection
}

describe('buildSolanaReclaimOrderParams', () => {
  it('keeps the cancelled orders whose rent the owner funded', async () => {
    const connection = makeConnection([
      accountInfo({ createdBy: owner, cancelled: true }),
      accountInfo({ createdBy: owner, cancelled: false }),
    ])

    const reclaimable = await buildSolanaReclaimOrderParams(
      connection,
      owner,
      [
        { id: idA, placedAt: SETTLED },
        { id: idB, placedAt: SETTLED },
      ],
      'prod',
    )

    expect(reclaimable).toEqual([{ id: idA, params: { ownerAddress: owner, orderPda: expect.any(PublicKey) } }])
  })

  it('skips sponsored orders, orders already reclaimed and accounts that do not decode', async () => {
    const connection = makeConnection([
      accountInfo({ createdBy: sponsor, cancelled: true }),
      null,
      { data: Buffer.alloc(10) },
    ])

    const reclaimable = await buildSolanaReclaimOrderParams(
      connection,
      owner,
      [idA, idB, idA].map((id) => ({ id, placedAt: SETTLED })),
      'prod',
    )

    expect(reclaimable).toEqual([])
  })

  it('asks for nothing when there are no orders to check', async () => {
    const connection = makeConnection([])

    const reclaimable = await buildSolanaReclaimOrderParams(connection, owner, [], 'prod')

    expect(reclaimable).toEqual([])
    expect(connection.getMultipleAccountsInfo).not.toHaveBeenCalled()
  })

  it('leaves a freshly placed order alone, since its creation transaction may still land', async () => {
    const connection = makeConnection([accountInfo({ createdBy: owner, cancelled: true })])

    const reclaimable = await buildSolanaReclaimOrderParams(
      connection,
      owner,
      [{ id: idA, placedAt: JUST_PLACED }],
      'prod',
    )

    expect(reclaimable).toEqual([])
    expect(connection.getMultipleAccountsInfo).not.toHaveBeenCalled()
  })
})
