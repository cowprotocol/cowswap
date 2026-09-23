import { decodeFunctionData, parseAbi } from 'viem'

import type { ICoWShedCall } from '@cowprotocol/sdk-cow-shed'

import { encodeTrustedExecuteHooksCalldata, buildEoaTwapTrustedExecuteTx } from './buildEoaTwapTrustedExecuteTx'

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
  it('targets the proxy when it is already deployed', () => {
    const tx = buildEoaTwapTrustedExecuteTx({
      proxyAddress: PROXY,
      factoryAddress: FACTORY,
      calls: SAMPLE_CALLS,
      isProxyDeployed: true,
    })

    expect(tx.to).toBe(PROXY)
    expect(tx.data.startsWith('0xc764c615')).toBe(true)
  })

  it('deploys the proxy and executes hooks through the factory without a setup signature', () => {
    const tx = buildEoaTwapTrustedExecuteTx({
      proxyAddress: PROXY,
      factoryAddress: FACTORY,
      calls: SAMPLE_CALLS,
      isProxyDeployed: false,
    })

    expect(tx.to).toBe(FACTORY)
    expect(
      decodeFunctionData({
        abi: parseAbi([
          'function executeOwnHooks((address target, uint256 value, bytes callData, bool allowFailure, bool isDelegateCall)[] calls) payable returns (address proxy)',
        ]),
        data: tx.data,
      }),
    ).toEqual({ functionName: 'executeOwnHooks', args: [SAMPLE_CALLS] })
  })
})
