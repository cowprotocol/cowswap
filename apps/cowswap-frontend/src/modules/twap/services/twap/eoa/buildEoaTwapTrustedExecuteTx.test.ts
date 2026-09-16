import { ContractsSigningScheme } from '@cowprotocol/sdk-contracts-ts'
import type { ICoWShedCall } from '@cowprotocol/sdk-cow-shed'

import { encodeTrustedExecuteHooksCalldata, buildEoaTwapTrustedExecuteTx } from './buildEoaTwapTrustedExecuteTx'

const ACCOUNT = '0x00000000000000000000000000000000000000aa' as const
const PROXY = '0x00000000000000000000000000000000000000bb' as const
const FACTORY = '0x00000000000000000000000000000000000000cc' as const

const SAMPLE_CALLS: ICoWShedCall[] = [
  {
    target: '0x0000000000000000000000000000000000000001',
    callData: '0xdeadbeef',
    value: 0n,
    allowFailure: false,
    isDelegateCall: false,
  },
]

describe('encodeTrustedExecuteHooksCalldata()', () => {
  it('uses the trustedExecuteHooks selector', () => {
    expect(encodeTrustedExecuteHooksCalldata(SAMPLE_CALLS).startsWith('0xc764c615')).toBe(true)
  })
})

describe('buildEoaTwapTrustedExecuteTx()', () => {
  const cowShedHooks = {
    signCalls: jest.fn().mockResolvedValue('0x1234'),
    encodeExecuteHooksForFactory: jest.fn().mockReturnValue('0xabcd'),
  }

  beforeEach(() => jest.clearAllMocks())

  it('targets the proxy when it is already deployed', async () => {
    const tx = await buildEoaTwapTrustedExecuteTx({
      account: ACCOUNT,
      proxyAddress: PROXY,
      factoryAddress: FACTORY,
      calls: SAMPLE_CALLS,
      isProxyDeployed: true,
      cowShedHooks,
    })

    expect(tx.to).toBe(PROXY)
    expect(tx.data.startsWith('0xc764c615')).toBe(true)
    expect(cowShedHooks.signCalls).not.toHaveBeenCalled()
  })

  it('signs the setup and routes new proxies through the factory', async () => {
    const before = Math.floor(Date.now() / 1000)
    const tx = await buildEoaTwapTrustedExecuteTx({
      account: ACCOUNT,
      proxyAddress: PROXY,
      factoryAddress: FACTORY,
      calls: SAMPLE_CALLS,
      isProxyDeployed: false,
      cowShedHooks,
    })

    expect(tx).toEqual({ to: FACTORY, data: '0xabcd' })
    expect(cowShedHooks.signCalls).toHaveBeenCalledWith(
      SAMPLE_CALLS,
      expect.stringMatching(/^0x[0-9a-f]{64}$/),
      expect.any(BigInt),
      ContractsSigningScheme.EIP712,
    )
    const [, nonce, deadline] = cowShedHooks.signCalls.mock.calls[0]
    expect(deadline).toBeGreaterThanOrEqual(BigInt(before + 20 * 60))
    expect(deadline).toBeLessThanOrEqual(BigInt(Math.floor(Date.now() / 1000) + 20 * 60))
    expect(cowShedHooks.encodeExecuteHooksForFactory).toHaveBeenCalledWith(
      SAMPLE_CALLS,
      nonce,
      deadline,
      ACCOUNT,
      '0x1234',
    )
  })

  it('stops setup when the user rejects the signature', async () => {
    const rejection = new Error('User rejected signature')
    cowShedHooks.signCalls.mockRejectedValueOnce(rejection)

    await expect(
      buildEoaTwapTrustedExecuteTx({
        account: ACCOUNT,
        proxyAddress: PROXY,
        factoryAddress: FACTORY,
        calls: SAMPLE_CALLS,
        isProxyDeployed: false,
        cowShedHooks,
      }),
    ).rejects.toBe(rejection)

    expect(cowShedHooks.encodeExecuteHooksForFactory).not.toHaveBeenCalled()
  })
})
