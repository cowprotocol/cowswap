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
  it('targets the proxy when it is already deployed', () => {
    const tx = buildEoaTwapTrustedExecuteTx({
      account: ACCOUNT,
      proxyAddress: PROXY,
      factoryAddress: FACTORY,
      calls: SAMPLE_CALLS,
      isProxyDeployed: true,
    })

    expect(tx.to).toBe(PROXY)
    expect(tx.data.startsWith('0xc764c615')).toBe(true)
  })

  it('batches initializeProxy and trustedExecuteHooks via Multicall3 for new proxies', () => {
    const tx = buildEoaTwapTrustedExecuteTx({
      account: ACCOUNT,
      proxyAddress: PROXY,
      factoryAddress: FACTORY,
      calls: SAMPLE_CALLS,
      isProxyDeployed: false,
    })

    expect(tx.to).toBe('0xcA11bde05977b3631167028862bE2a173976CA11')
    expect(tx.data.startsWith('0x252dba42')).toBe(true)
    expect(tx.data.toLowerCase()).toContain(FACTORY.slice(2).toLowerCase())
    expect(tx.data.toLowerCase()).toContain(PROXY.slice(2).toLowerCase())
  })
})
