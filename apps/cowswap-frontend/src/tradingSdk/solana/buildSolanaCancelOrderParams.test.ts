/**
 * PublicKey.isOnCurve misreports every point as on-curve under jsdom, exhausting findProgramAddressSync's bumps.
 * @jest-environment node
 */
import { Connection, PublicKey } from '@solana/web3.js'

import { buildSolanaCancelOrderParams } from './buildSolanaCancelOrderParams'
import { buildSolanaOrderIntent, SolanaIntentOrder } from './buildSolanaOrderIntent'

jest.mock('./buildSolanaOrderIntent')

const mockBuildSolanaOrderIntent = buildSolanaOrderIntent as jest.MockedFunction<typeof buildSolanaOrderIntent>

const owner = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')
const idA = '0x1f2a3b4c5d6e7f809192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f'
const idB = '0x2f2a3b4c5d6e7f809192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f'
const orderA = { id: idA } as SolanaIntentOrder
const orderB = { id: idB } as SolanaIntentOrder
const intent = { sellAmount: 1n } as NonNullable<Awaited<ReturnType<typeof buildSolanaOrderIntent>>>

function makeConnection(accounts: Array<object | null>): Connection {
  return { getMultipleAccountsInfo: jest.fn().mockResolvedValue(accounts) } as unknown as Connection
}

describe('buildSolanaCancelOrderParams', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockBuildSolanaOrderIntent.mockResolvedValue(intent)
  })

  it('attaches the intent only to orders whose PDA is not on-chain yet', async () => {
    const connection = makeConnection([{ lamports: 1 }, null])

    const params = await buildSolanaCancelOrderParams(
      connection,
      owner,
      [
        { id: idA, order: orderA },
        { id: idB, order: orderB },
      ],
      'prod',
    )

    expect(params).toEqual([
      { ownerAddress: owner, orderPda: expect.any(PublicKey), intent: undefined },
      { ownerAddress: owner, orderPda: expect.any(PublicKey), intent },
    ])
    expect(mockBuildSolanaOrderIntent).toHaveBeenCalledTimes(1)
    expect(mockBuildSolanaOrderIntent).toHaveBeenCalledWith(orderB)
    expect(connection.getMultipleAccountsInfo).toHaveBeenCalledWith([params[0].orderPda, params[1].orderPda])
  })

  it('omits the intent when the stored order is unknown', async () => {
    const params = await buildSolanaCancelOrderParams(
      makeConnection([null]),
      owner,
      [{ id: idA, order: undefined }],
      'prod',
    )

    expect(params[0].intent).toBeUndefined()
    expect(mockBuildSolanaOrderIntent).not.toHaveBeenCalled()
  })
})
