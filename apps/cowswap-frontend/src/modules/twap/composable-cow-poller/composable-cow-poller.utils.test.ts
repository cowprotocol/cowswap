import { decodeFunctionData, encodeAbiParameters, keccak256 } from 'viem'

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

const FIRST_REGISTER_SCHEDULE: ComposableCowPollerSchedule = {
  handler: HANDLER,
  authEpoch: COMPOSABLE_COW_POLLER_INITIAL_AUTH_EPOCH,
  funder: FUNDER,
  owner: OWNER,
  salt: SALT,
  staticInput: STATIC_INPUT,
}

describe('getComposableCowPollerScheduleId()', () => {
  it('hashes funder, handler, owner, salt in that order', () => {
    const id = getComposableCowPollerScheduleId({
      funder: FUNDER,
      handler: HANDLER,
      owner: OWNER,
      salt: SALT,
    })

    expect(id).toMatch(/^0x[0-9a-f]{64}$/)
    expect(
      getComposableCowPollerScheduleId({
        funder: FUNDER,
        handler: HANDLER,
        owner: OWNER,
        salt: SALT,
      }),
    ).toBe(id)
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
    const withDifferentStatic = getComposableCowPollerScheduleId({
      ...FIRST_REGISTER_SCHEDULE,
      staticInput: '0xabcd',
    })

    expect(withoutAuth).toBe(withDifferentStatic)
    expect(withoutAuth).toBe(
      keccak256(
        encodeAbiParameters(
          [{ type: 'address' }, { type: 'address' }, { type: 'address' }, { type: 'bytes32' }],
          [FUNDER, HANDLER, OWNER, SALT],
        ),
      ),
    )
  })
})
