import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Web3Provider } from '@ethersproject/providers'

import { ExtensibleFallbackVerification, verifyExtensibleFallback } from './verifyExtensibleFallback'

import { ExtensibleFallbackContext } from '../hooks/useExtensibleFallbackContext'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const defaultJsonRpcHandler = (method: string) => {
  if (method === 'eth_chainId') return Promise.resolve(5)

  return Promise.resolve(null)
}
const context: ExtensibleFallbackContext = {
  chainId: SupportedChainId.SEPOLIA,
  safeAddress: '0x360Ba61Bc799edfa01e306f1eCCb2F6e0C3C8c8e',
  settlementContract: {
    callStatic: { domainSeparator: () => '0xa5b986c2f5845d520bcb903639360b147735589732066cea24a3a59678025c94' },
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
  provider: new Web3Provider(defaultJsonRpcHandler),
}

describe('verifyExtensibleFallback', () => {
  describe('When a safe has ExtensibleFallback', () => {
    it('And has ComposableCow as a domain verifier, then should return HAS_DOMAIN_VERIFIER', async () => {
      const result = await verifyExtensibleFallback({
        ...context,
        // TODO: Replace any with proper type definitions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        provider: new Web3Provider((method: string, params: any[] | undefined) => {
          // domainVerifiers()
          if (method === 'eth_call' && params?.[0]?.data?.startsWith('0x51cad5ee')) {
            //Composable cow address
            return Promise.resolve('0x000000000000000000000000fdaFc9d1902f4e0b84f65F49f244b32b31013b74')
          }

          return defaultJsonRpcHandler(method)
        }),
      })

      expect(result).toBe(ExtensibleFallbackVerification.HAS_DOMAIN_VERIFIER)
    })

    it('And does NOT have ComposableCow as a domain verifier, then should return HAS_EXTENSIBLE_FALLBACK', async () => {
      const result = await verifyExtensibleFallback({
        ...context,
        // TODO: Replace any with proper type definitions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        provider: new Web3Provider((method: string, params: any[] | undefined) => {
          // domainVerifiers()
          if (method === 'eth_call' && params?.[0]?.data?.startsWith('0x51cad5ee')) {
            //Composable cow address
            return Promise.resolve('0x000000000000000000000000111111111117dc0aa78b770fa6a738034120c302')
          }

          return defaultJsonRpcHandler(method)
        }),
      })

      expect(result).toBe(ExtensibleFallbackVerification.HAS_EXTENSIBLE_FALLBACK)
    })
  })

  describe('When a safe does not have ExtensibleFallback', () => {
    it('Then should return HAS_NOTHING', async () => {
      const result = await verifyExtensibleFallback(context)

      expect(result).toBe(ExtensibleFallbackVerification.HAS_NOTHING)
    })
  })
})
