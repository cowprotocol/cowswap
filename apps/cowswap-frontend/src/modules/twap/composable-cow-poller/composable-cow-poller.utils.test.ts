import { decodeFunctionData, encodeAbiParameters } from 'viem'

import { ComposableCowPollerAbi } from '@cowprotocol/cowswap-abis'

import {
  COMPOSABLE_COW_POLLER_INITIAL_AUTH_EPOCH,
  type ComposableCowPollerSchedule,
} from './composable-cow-poller.constants'
import {
  encodePollFundsCalldata,
  encodeRegisterFromShedCalldata,
  getComposableCowPollerScheduleId,
} from './composable-cow-poller.utils'

const FUNDER = '0x1111111111111111111111111111111111111111' as const
const HANDLER = '0x2222222222222222222222222222222222222222' as const
const OWNER = '0x3333333333333333333333333333333333333333' as const
const SALT = '0x0000000000000000000000000000000000000000000000000000000000000001' as const
const STATIC_INPUT = '0x1234' as const

/**
 * Independent Solidity vector for `keccak256(abi.encode(funder, handler, owner, salt))`
 * over the fixtures above. Computed with Foundry `cast keccak` of the ABI-encoded identity
 * fields (same formula as `ComposableCowPoller._scheduleId`), not by re-running the TS helper.
 *
 * @see https://github.com/cowprotocol/composable-cow/blob/main/src/types/ComposableCowPoller.sol
 */
const EXPECTED_SCHEDULE_ID = '0x4a6d31b249226ff992ea760b06288a012f917aa317e6be37829d163e51af97ad' as const

const FIRST_REGISTER_SCHEDULE: ComposableCowPollerSchedule = {
  handler: HANDLER,
  authEpoch: COMPOSABLE_COW_POLLER_INITIAL_AUTH_EPOCH,
  funder: FUNDER,
  owner: OWNER,
  salt: SALT,
  staticInput: STATIC_INPUT,
}

describe('getComposableCowPollerScheduleId()', () => {
  it('matches the Solidity _scheduleId hash for funder, handler, owner, salt', () => {
    expect(
      getComposableCowPollerScheduleId({
        funder: FUNDER,
        handler: HANDLER,
        owner: OWNER,
        salt: SALT,
      }),
    ).toBe(EXPECTED_SCHEDULE_ID)
  })
})

describe('encodePollFundsCalldata()', () => {
  it('encodes pollFunds selector with schedule id', () => {
    const id = getComposableCowPollerScheduleId({
      funder: FUNDER,
      handler: HANDLER,
      owner: OWNER,
      salt: SALT,
    })
    const callData = encodePollFundsCalldata(id)

    expect(callData.startsWith('0x')).toBe(true)
    expect(callData).toContain(id.slice(2))
  })
})

describe('encodeRegisterFromShedCalldata()', () => {
  it('encodes a uint96 authEpoch of 0 between handler and funder on first register', () => {
    const callData = encodeRegisterFromShedCalldata(FIRST_REGISTER_SCHEDULE)

    const decoded = decodeFunctionData({
      abi: ComposableCowPollerAbi,
      data: callData,
    })

    expect(decoded.functionName).toBe('registerFromShed')

    const [schedule] = decoded.args as [ComposableCowPollerSchedule]
    expect(schedule.handler.toLowerCase()).toBe(HANDLER.toLowerCase())
    expect(schedule.authEpoch).toBe(0n)
    expect(schedule.funder.toLowerCase()).toBe(FUNDER.toLowerCase())
    expect(schedule.owner.toLowerCase()).toBe(OWNER.toLowerCase())
    expect(schedule.salt).toBe(SALT)
    expect(schedule.staticInput).toBe(STATIC_INPUT)

    // Fixture: packed tuple head includes a zero uint96 word after handler.
    // ABI encoding of the dynamic tuple starts at word 1; handler is word 0 of the tuple,
    // authEpoch is word 1 (must be 0 for first registration).
    const expectedAuthEpochWord = encodeAbiParameters([{ type: 'uint96' }], [0n]).slice(2)
    const handlerWord = HANDLER.slice(2).toLowerCase().padStart(64, '0')
    const funderWord = FUNDER.slice(2).toLowerCase().padStart(64, '0')
    const packed = callData.toLowerCase()

    expect(packed).toContain(`${handlerWord}${expectedAuthEpochWord}${funderWord}`)
  })

  it('keeps schedule id independent of authEpoch / staticInput', () => {
    const withoutAuth = getComposableCowPollerScheduleId(FIRST_REGISTER_SCHEDULE)
    const scheduleWithDifferentStatic: ComposableCowPollerSchedule = {
      ...FIRST_REGISTER_SCHEDULE,
      staticInput: '0xabcd',
    }
    const withDifferentStatic = getComposableCowPollerScheduleId(scheduleWithDifferentStatic)

    expect(withoutAuth).toBe(withDifferentStatic)
    expect(withoutAuth).toBe(EXPECTED_SCHEDULE_ID)
  })
})
