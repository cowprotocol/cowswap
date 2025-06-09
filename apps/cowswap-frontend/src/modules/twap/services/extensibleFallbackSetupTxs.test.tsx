import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Web3Provider } from '@ethersproject/providers'

import { extensibleFallbackSetupTxs } from './extensibleFallbackSetupTxs'

import { ExtensibleFallbackContext } from '../hooks/useExtensibleFallbackContext'

describe('extensibleFallbackSetupTxs - service to generate transactions for ExtensibleFallback setup', () => {
  it('Should create a bundle of two transactions: setFallbackHandler and setDomainVerifier', async () => {
    const context: ExtensibleFallbackContext = {
      chainId: SupportedChainId.SEPOLIA,
      safeAddress: '0xA12D770028d7072b80BAEb6A1df962cccfd1dddd',
      settlementContract: {
        callStatic: { domainSeparator: () => '0xa5b986c2f5845d520bcb903639360b147735589732066cea24a3a59678025c94' },
      // TODO: Replace any with proper type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      provider: new Web3Provider(() => Promise.resolve(null)),
    }

    const result = await extensibleFallbackSetupTxs(context)

    expect(result).toMatchSnapshot()
  })
})
