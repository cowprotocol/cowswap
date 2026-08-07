import {
  encodePollFundsCalldata,
  getComposableCowPollerRegisterTypedData,
  getComposableCowPollerScheduleId,
} from './composable-cow-poller.utils'

const FUND = '0x1111111111111111111111111111111111111111' as const
const HANDLER = '0x2222222222222222222222222222222222222222' as const
const OWNER = '0x3333333333333333333333333333333333333333' as const
const SALT = '0x0000000000000000000000000000000000000000000000000000000000000001' as const
const STATIC_INPUT = '0x1234' as const
const POLLER = '0x4444444444444444444444444444444444444444' as const

describe('getComposableCowPollerScheduleId()', () => {
  it('hashes funder, handler, owner, salt in that order', () => {
    const id = getComposableCowPollerScheduleId({
      funder: FUND,
      handler: HANDLER,
      owner: OWNER,
      salt: SALT,
    })

    expect(id).toMatch(/^0x[0-9a-f]{64}$/)
    expect(
      getComposableCowPollerScheduleId({
        funder: FUND,
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
      funder: FUND,
      handler: HANDLER,
      owner: OWNER,
      salt: SALT,
    })
    const callData = encodePollFundsCalldata(id)

    expect(callData.startsWith('0xf8374030')).toBe(true)
    expect(callData).toContain(id.slice(2))
  })
})

describe('getComposableCowPollerRegisterTypedData()', () => {
  it('builds EIP-712 Register typed data matching cow-sdk #959', () => {
    const typedData = getComposableCowPollerRegisterTypedData({
      chainId: 1,
      pollerAddress: POLLER,
      schedule: {
        handler: HANDLER,
        funder: FUND,
        owner: OWNER,
        salt: SALT,
        staticInput: STATIC_INPUT,
      },
      nonce: 7n,
      deadline: 2_000_000_000n,
    })

    expect(typedData.domain).toEqual({
      name: 'ComposableCowPoller',
      version: '1',
      chainId: 1,
      verifyingContract: POLLER,
    })
    expect(typedData.primaryType).toBe('Register')
    expect(typedData.message.handler).toBe(HANDLER)
    expect(typedData.message.funder).toBe(FUND)
    expect(typedData.message.owner).toBe(OWNER)
    expect(typedData.message.salt).toBe(SALT)
    expect(typedData.message.nonce).toBe(7n)
    expect(typedData.message.deadline).toBe(2_000_000_000n)
    expect(typedData.message.staticInputHash).toMatch(/^0x[0-9a-f]{64}$/)
  })
})
