import { TOKEN_2022_TAG, TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useAddUserToken, useFetchTokenFromBlockchain, useTokensByAddressMap } from '@cowprotocol/tokens'
import { TokenInfo } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useTokensForOrdersList } from './useTokensForOrdersList'

jest.mock('@cowprotocol/tokens', () => ({
  useAddUserToken: jest.fn(),
  useFetchTokenFromBlockchain: jest.fn(),
  useTokensByAddressMap: jest.fn(),
}))
jest.mock('@cowprotocol/wallet', () => ({ useWalletInfo: jest.fn() }))

const mockedUseAddUserToken = useAddUserToken as jest.MockedFunction<typeof useAddUserToken>
const mockedUseFetchTokenFromBlockchain = useFetchTokenFromBlockchain as jest.MockedFunction<
  typeof useFetchTokenFromBlockchain
>
const mockedUseTokensByAddressMap = useTokensByAddressMap as jest.MockedFunction<typeof useTokensByAddressMap>
const mockedUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>

const PAID_MINT = '98kfF7rmsg1QDUEoCqNE7g7M1FdrTt92TEp2CLzypump'
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

const PAID: TokenInfo = {
  chainId: SupportedChainId.SOLANA,
  address: PAID_MINT,
  decimals: 6,
  symbol: 'PAID',
  name: 'Paid',
  tags: [TOKEN_2022_TAG],
}
const USDC = new TokenWithLogo(undefined, SupportedChainId.SOLANA, USDC_MINT, 6, 'USDC', 'USD Coin')

describe('useTokensForOrdersList', () => {
  const addUserTokens = jest.fn()
  const fetchTokenFromBlockchain = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseWalletInfo.mockReturnValue({ chainId: SupportedChainId.SOLANA } as ReturnType<typeof useWalletInfo>)
    mockedUseTokensByAddressMap.mockReturnValue({ [USDC_MINT]: USDC })
    mockedUseAddUserToken.mockReturnValue(addUserTokens)
    mockedUseFetchTokenFromBlockchain.mockReturnValue(fetchTokenFromBlockchain)
    fetchTokenFromBlockchain.mockResolvedValue(PAID)
  })

  it('imports an unknown Solana mint under its case-sensitive address and keeps the Token-2022 tag', async () => {
    const { result } = renderHook(() => useTokensForOrdersList())

    const tokens = await result.current([PAID_MINT, USDC_MINT])

    expect(fetchTokenFromBlockchain).toHaveBeenCalledTimes(1)
    expect(fetchTokenFromBlockchain).toHaveBeenCalledWith(PAID_MINT, SupportedChainId.SOLANA)

    const paid = tokens[PAID_MINT]
    expect(paid).toBeInstanceOf(TokenWithLogo)
    expect(paid).toMatchObject({ address: PAID_MINT, symbol: 'PAID', decimals: 6, tags: [TOKEN_2022_TAG] })
    expect(tokens[USDC_MINT]).toBe(USDC)
    expect(addUserTokens).toHaveBeenCalledWith([paid])
  })

  it('skips tokens the fetcher cannot resolve', async () => {
    fetchTokenFromBlockchain.mockResolvedValue(null)
    const { result } = renderHook(() => useTokensForOrdersList())

    const tokens = await result.current([PAID_MINT])

    expect(tokens[PAID_MINT]).toBeUndefined()
    expect(addUserTokens).not.toHaveBeenCalled()
  })
})
