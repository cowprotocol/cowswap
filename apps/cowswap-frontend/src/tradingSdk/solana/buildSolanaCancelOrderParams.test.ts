/**
 * PublicKey.isOnCurve misreports every point as on-curve under jsdom, exhausting findProgramAddressSync's bumps.
 * @jest-environment node
 */
import { ENCODED_ORDER_ACCOUNT_SIZE } from '@cowprotocol/sdk-trading-solana'

import { Connection, PublicKey } from '@solana/web3.js'

import { buildSolanaCancelOrderParams } from './buildSolanaCancelOrderParams'
import { buildSolanaOrderIntent, SolanaIntentOrder } from './buildSolanaOrderIntent'

jest.mock('./buildSolanaOrderIntent')

const mockBuildSolanaOrderIntent = buildSolanaOrderIntent as jest.MockedFunction<typeof buildSolanaOrderIntent>

const owner = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')
const sponsor = new PublicKey('So11111111111111111111111111111111111111112')
const idA = '0x1f2a3b4c5d6e7f809192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f'
const idB = '0x2f2a3b4c5d6e7f809192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f'
const orderA = { id: idA } as SolanaIntentOrder
const orderB = { id: idB } as SolanaIntentOrder
const intent = { sellAmount: 1n } as NonNullable<Awaited<ReturnType<typeof buildSolanaOrderIntent>>>

function accountInfo(createdBy: PublicKey): { data: Buffer } {
  const data = Buffer.alloc(ENCODED_ORDER_ACCOUNT_SIZE)

  data[0] = 0x80
  data.set(createdBy.toBytes(), 19)

  return { data }
}

function makeConnection(accounts: Array<object | null>): Connection {
  return { getMultipleAccountsInfo: jest.fn().mockResolvedValue(accounts) } as unknown as Connection
}

describe('buildSolanaCancelOrderParams', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockBuildSolanaOrderIntent.mockResolvedValue(intent)
  })

  it('attaches the intent only to orders whose PDA is not on-chain yet', async () => {
    const connection = makeConnection([accountInfo(owner), null])

    const { cancelParams } = await buildSolanaCancelOrderParams(
      connection,
      owner,
      [
        { id: idA, order: orderA },
        { id: idB, order: orderB },
      ],
      'prod',
    )

    expect(cancelParams).toEqual([
      { ownerAddress: owner, orderPda: expect.any(PublicKey), intent: undefined },
      { ownerAddress: owner, orderPda: expect.any(PublicKey), intent },
    ])
    expect(mockBuildSolanaOrderIntent).toHaveBeenCalledTimes(1)
    expect(mockBuildSolanaOrderIntent).toHaveBeenCalledWith(orderB)
    expect(connection.getMultipleAccountsInfo).toHaveBeenCalledWith([
      cancelParams[0].orderPda,
      cancelParams[1].orderPda,
    ])
  })

  it('omits the intent when the stored order is unknown', async () => {
    const { cancelParams } = await buildSolanaCancelOrderParams(
      makeConnection([null]),
      owner,
      [{ id: idA, order: undefined }],
      'prod',
    )

    expect(cancelParams[0].intent).toBeUndefined()
    expect(mockBuildSolanaOrderIntent).not.toHaveBeenCalled()
  })

  it('omits the intent when the on-chain account does not decode, since the PDA is there either way', async () => {
    const { cancelParams, reclaimParams } = await buildSolanaCancelOrderParams(
      makeConnection([{ data: Buffer.alloc(10) }]),
      owner,
      [{ id: idA, order: orderA }],
      'prod',
    )

    expect(cancelParams[0].intent).toBeUndefined()
    expect(mockBuildSolanaOrderIntent).not.toHaveBeenCalled()
    expect(reclaimParams).toEqual([])
  })

  it('reclaims the rent of orders already on-chain that the owner paid for', async () => {
    const { cancelParams, reclaimParams } = await buildSolanaCancelOrderParams(
      makeConnection([accountInfo(owner)]),
      owner,
      [{ id: idA, order: orderA }],
      'prod',
    )

    expect(reclaimParams).toEqual([{ ownerAddress: owner, orderPda: cancelParams[0].orderPda }])
  })

  it('leaves the rent of a sponsored order alone, since the program only pays its funder', async () => {
    const { reclaimParams } = await buildSolanaCancelOrderParams(
      makeConnection([accountInfo(sponsor)]),
      owner,
      [{ id: idA, order: orderA }],
      'prod',
    )

    expect(reclaimParams).toEqual([])
  })

  it('does not reclaim an order the cancellation itself creates, which must record the cancellation', async () => {
    const { reclaimParams } = await buildSolanaCancelOrderParams(
      makeConnection([null]),
      owner,
      [{ id: idA, order: orderA }],
      'prod',
    )

    expect(reclaimParams).toEqual([])
  })
})
