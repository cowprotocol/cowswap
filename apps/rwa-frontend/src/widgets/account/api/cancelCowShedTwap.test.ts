import { decodeFunctionData, parseAbi } from 'viem'
import { getConnection, sendTransaction, switchChain } from 'wagmi/actions'

/* eslint-disable @typescript-eslint/no-restricted-imports */
import { COMPOSABLE_COW_CONTRACT_ADDRESS, COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS } from '@cowprotocol/cow-sdk'
/* eslint-enable @typescript-eslint/no-restricted-imports */

import { cancelCowShedTwap } from './cancelCowShedTwap'

import { programmaticOrderApi } from '@/shared/api'

jest.mock('wagmi/actions', () => ({ getConnection: jest.fn(), sendTransaction: jest.fn(), switchChain: jest.fn() }))
jest.mock('@/shared/api', () => ({ programmaticOrderApi: { getTwapPartOrders: jest.fn() } }))

const getPartsMock = programmaticOrderApi.getTwapPartOrders as jest.Mock
const sendTransactionMock = sendTransaction as jest.Mock
const CONFIG = {} as never
const TWAP = {
  eventId: 'event-1',
  hash: `0x${'aa'.repeat(32)}`,
  cowShedAddress: '0x0000000000000000000000000000000000000c0e',
}
const PART_UID = `0x${'bb'.repeat(56)}`
const ABI = parseAbi([
  'struct Call { address target; uint256 value; bytes callData; bool allowFailure; bool isDelegateCall; }',
  'function trustedExecuteHooks(Call[] calls)',
  'function remove(bytes32 singleOrderHash)',
  'function invalidateOrder(bytes orderUid)',
])

function sentCalls(): { target: string; call: { functionName: string; args: readonly unknown[] } }[] {
  const { to, data } = sendTransactionMock.mock.calls[0][1]

  expect(to).toBe(TWAP.cowShedAddress)

  const { args } = decodeFunctionData({ abi: ABI, data })
  const [calls] = args as [{ target: string; callData: `0x${string}` }[]]

  return calls.map(({ target, callData }) => ({
    target,
    call: decodeFunctionData({ abi: ABI, data: callData }) as { functionName: string; args: readonly unknown[] },
  }))
}

describe('cancelCowShedTwap', () => {
  beforeEach(() => {
    ;(getConnection as jest.Mock).mockReturnValue({ chainId: 1 })
    sendTransactionMock.mockResolvedValue('0xtx')
  })

  afterEach(() => jest.resetAllMocks())

  it('removes the TWAP and invalidates its open part', async () => {
    getPartsMock.mockResolvedValue({ items: [{ orderUid: PART_UID, status: 'open' }], totalCount: 1 })

    await expect(cancelCowShedTwap({ config: CONFIG, chainId: 1, twap: TWAP })).resolves.toBe('0xtx')

    expect(getPartsMock).toHaveBeenCalledWith({ eventId: 'event-1', chainId: 1 }, { direction: 'desc', limit: 1 })
    expect(sentCalls()).toEqual([
      { target: COMPOSABLE_COW_CONTRACT_ADDRESS[1], call: { functionName: 'remove', args: [TWAP.hash] } },
      {
        target: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[1],
        call: { functionName: 'invalidateOrder', args: [PART_UID] },
      },
    ])
    expect(switchChain).not.toHaveBeenCalled()
  })

  it('only removes the TWAP between parts', async () => {
    getPartsMock.mockResolvedValue({ items: [{ orderUid: PART_UID, status: 'fulfilled' }], totalCount: 1 })
    ;(getConnection as jest.Mock).mockReturnValue({ chainId: 100 })

    await cancelCowShedTwap({ config: CONFIG, chainId: 1, twap: TWAP })

    expect(switchChain).toHaveBeenCalledWith(CONFIG, { chainId: 1 })
    expect(sentCalls().map(({ call }) => call.functionName)).toEqual(['remove'])
  })
})
