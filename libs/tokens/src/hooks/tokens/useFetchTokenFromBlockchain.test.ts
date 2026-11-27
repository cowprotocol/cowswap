import { useConfig } from 'wagmi'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenInfo } from '@cowprotocol/types'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { renderHook } from '@testing-library/react'

import { useFetchTokenFromBlockchain } from './useFetchTokenFromBlockchain'

import { fetchSolanaTokenFromBlockchain } from '../../utils/fetchSolanaTokenFromBlockchain'
import { fetchTokenFromBlockchain } from '../../utils/fetchTokenFromBlockchain'

jest.mock('wagmi', () => ({ useConfig: jest.fn() }))
jest.mock('@reown/appkit-adapter-solana/react', () => ({ useAppKitConnection: jest.fn() }))
jest.mock('../../utils/fetchSolanaTokenFromBlockchain', () => ({ fetchSolanaTokenFromBlockchain: jest.fn() }))
jest.mock('../../utils/fetchTokenFromBlockchain', () => ({ fetchTokenFromBlockchain: jest.fn() }))

const mockedUseConfig = useConfig as jest.MockedFunction<typeof useConfig>
const mockedUseAppKitConnection = useAppKitConnection as jest.MockedFunction<typeof useAppKitConnection>
const mockedFetchSolanaToken = fetchSolanaTokenFromBlockchain as jest.MockedFunction<
  typeof fetchSolanaTokenFromBlockchain
>
const mockedFetchEvmToken = fetchTokenFromBlockchain as jest.MockedFunction<typeof fetchTokenFromBlockchain>

const COW_ADDRESS = '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB'
const PAID_MINT = '98kfF7rmsg1QDUEoCqNE7g7M1FdrTt92TEp2CLzypump'

const config = {} as ReturnType<typeof useConfig>
const connection = { rpcEndpoint: 'https://solana.rpc' } as NonNullable<
  ReturnType<typeof useAppKitConnection>['connection']
>

const COW: TokenInfo = {
  chainId: SupportedChainId.MAINNET,
  address: COW_ADDRESS,
  decimals: 18,
  symbol: 'COW',
  name: 'CoW Protocol Token',
}
const PAID: TokenInfo = {
  chainId: SupportedChainId.SOLANA,
  address: PAID_MINT,
  decimals: 6,
  symbol: 'PAID',
  name: 'Paid',
}

function renderFetcher(): ReturnType<typeof useFetchTokenFromBlockchain> {
  return renderHook(() => useFetchTokenFromBlockchain()).result.current
}

describe('useFetchTokenFromBlockchain', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseConfig.mockReturnValue(config)
    mockedUseAppKitConnection.mockReturnValue({ connection })
    mockedFetchEvmToken.mockResolvedValue(COW)
    mockedFetchSolanaToken.mockResolvedValue(PAID)
  })

  it('reads an EVM address with the ERC-20 reader', async () => {
    const token = await renderFetcher()(COW_ADDRESS, SupportedChainId.MAINNET)

    expect(token).toBe(COW)
    expect(mockedFetchEvmToken).toHaveBeenCalledWith(COW_ADDRESS, SupportedChainId.MAINNET, config)
    expect(mockedFetchSolanaToken).not.toHaveBeenCalled()
  })

  it('reads a Solana mint with the Solana reader', async () => {
    const token = await renderFetcher()(PAID_MINT, SupportedChainId.SOLANA)

    expect(token).toBe(PAID)
    expect(mockedFetchSolanaToken).toHaveBeenCalledWith(PAID_MINT, SupportedChainId.SOLANA, connection)
    expect(mockedFetchEvmToken).not.toHaveBeenCalled()
  })

  it('returns null on Solana until the connection is ready', async () => {
    mockedUseAppKitConnection.mockReturnValue({ connection: undefined })

    const token = await renderFetcher()(PAID_MINT, SupportedChainId.SOLANA)

    expect(token).toBeNull()
    expect(mockedFetchSolanaToken).not.toHaveBeenCalled()
  })

  it.each([
    ['an EVM address on Solana', COW_ADDRESS, SupportedChainId.SOLANA],
    ['a Solana mint on an EVM chain', PAID_MINT, SupportedChainId.MAINNET],
  ])('returns null for %s', async (_, address, chainId) => {
    const token = await renderFetcher()(address, chainId)

    expect(token).toBeNull()
    expect(mockedFetchEvmToken).not.toHaveBeenCalled()
    expect(mockedFetchSolanaToken).not.toHaveBeenCalled()
  })
})
