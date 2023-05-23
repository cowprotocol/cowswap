import { setupExtensibleFallbackHandler } from './setupExtensibleFallbackHandler'
import { renderHook } from '@testing-library/react-hooks'
import { useUpdateAtom } from 'jotai/utils'
import { walletInfoAtom } from 'modules/wallet/api/state'
import { useEffect } from 'react'
import { useExtensibleFallbackContext } from '../hooks/useExtensibleFallbackContext'
import { useSafeAppsSdk } from 'modules/wallet/web3-react/hooks/useSafeAppsSdk'
import { useGP2SettlementContract } from 'legacy/hooks/useContract'
import { WithMockedWeb3 } from 'test-utils'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

const chainId = 5

jest.mock('modules/wallet/web3-react/hooks/useSafeAppsSdk')
jest.mock('legacy/hooks/useContract')
jest.mock('@web3-react/core', () => {
  return {
    ...jest.requireActual('@web3-react/core'),
    useWeb3React: jest.fn(),
  }
})

const defaultJsonRpcHandler = (method: string, params?: any[]) => {
  if (method === 'eth_chainId') return Promise.resolve(5)

  // domainVerifiers()
  if (method === 'eth_call' && params?.[0]?.data?.startsWith('0x51cad5ee')) {
    //Composable cow address
    return Promise.resolve('0x000000000000000000000000a31b99bd44528c7bae9e1f675d810ae13b0e29aa')
  }

  return Promise.resolve(null)
}

const useWeb3ReactMock = useWeb3React as jest.MockedFunction<typeof useWeb3React>
const useSafeAppsSdkMock = useSafeAppsSdk as jest.MockedFunction<typeof useSafeAppsSdk>
const useGP2SettlementContractMock = useGP2SettlementContract as jest.MockedFunction<typeof useGP2SettlementContract>

describe('setupExtensibleFallbackHandler - integration test', () => {
  beforeEach(() => {
    useWeb3ReactMock.mockReturnValue({ provider: new Web3Provider(defaultJsonRpcHandler) } as any)
    useSafeAppsSdkMock.mockReturnValue({
      safe: {
        getInfo: () => ({ safeAddress: '0xA12D770028d7072b80BAEb6A1df962cccfd1dddd' }),
      },
      txs: { send: () => Promise.resolve({ safeTxHash: '0x00c' }) },
    } as any)
    useGP2SettlementContractMock.mockReturnValue({
      callStatic: { domainSeparator: () => '0xa5b986c2f5845d520bcb903639360b147735589732066cea24a3a59678025c94' },
    } as any)
  })

  it('Should create a bundle of transaction to setup fallback handler and domain verifier', async () => {
    const { result } = renderHook(
      () => {
        const updateWalletInfo = useUpdateAtom(walletInfoAtom)

        useEffect(() => {
          updateWalletInfo({ chainId })
        }, [updateWalletInfo])

        const context = useExtensibleFallbackContext()

        if (!context) return null

        return setupExtensibleFallbackHandler(context)
      },
      { wrapper: WithMockedWeb3 }
    )

    expect(await result.current).toEqual({ safeTxHash: '0x00c' })
  })
})
