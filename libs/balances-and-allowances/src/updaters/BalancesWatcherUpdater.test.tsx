import React from 'react'

import { AddressKey, getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

import { render } from '@testing-library/react'

import { BalancesWatcherUpdater } from './BalancesWatcherUpdater'

import { UseBalancesWatcherSessionParams } from '../hooks/useBalancesWatcherSession'

jest.mock('../hooks/useBalancesWatcherSession', () => ({
  useBalancesWatcherSession: jest.fn(),
}))
jest.mock('../hooks/useCustomTokensForChain', () => ({
  useCustomTokensForChain: jest.fn(),
}))
jest.mock('../hooks/useEnabledTokensListsUrls', () => ({
  useEnabledTokensListsUrls: jest.fn(),
}))
jest.mock('./BalancesCacheUpdater', () => ({
  BalancesCacheUpdater: jest.fn(() => null),
}))
jest.mock('./BalancesResetUpdater', () => ({
  BalancesResetUpdater: jest.fn(() => null),
}))
jest.mock('./NativeTokenBalanceUpdater', () => ({
  NativeTokenBalanceUpdater: jest.fn(() => null),
}))

const mockUseBalancesWatcherSession = jest.requireMock<{ useBalancesWatcherSession: jest.Mock }>(
  '../hooks/useBalancesWatcherSession',
).useBalancesWatcherSession
const mockUseCustomTokensForChain = jest.requireMock<{ useCustomTokensForChain: jest.Mock }>(
  '../hooks/useCustomTokensForChain',
).useCustomTokensForChain
const mockUseEnabledTokensListsUrls = jest.requireMock<{ useEnabledTokensListsUrls: jest.Mock }>(
  '../hooks/useEnabledTokensListsUrls',
).useEnabledTokensListsUrls
const mockBalancesCacheUpdater = jest.requireMock<{ BalancesCacheUpdater: jest.Mock }>(
  './BalancesCacheUpdater',
).BalancesCacheUpdater
const mockBalancesResetUpdater = jest.requireMock<{ BalancesResetUpdater: jest.Mock }>(
  './BalancesResetUpdater',
).BalancesResetUpdater
const mockNativeTokenBalanceUpdater = jest.requireMock<{ NativeTokenBalanceUpdater: jest.Mock }>(
  './NativeTokenBalanceUpdater',
).NativeTokenBalanceUpdater

const ACCOUNT = '0x1234567890123456789012345678901234567890'
const ENABLED_LIST_URL = 'https://example.com/tokens.json'
const CUSTOM_TOKEN: AddressKey = getAddressKey('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')
const BRIDGE_TOKEN: AddressKey = getAddressKey('0xdAC17F958D2ee523a2206206994597C13D831ec7')

function lastSessionParams(): UseBalancesWatcherSessionParams {
  const calls = mockUseBalancesWatcherSession.mock.calls
  expect(calls.length).toBeGreaterThan(0)
  return calls[calls.length - 1][0] as UseBalancesWatcherSessionParams
}

describe('BalancesWatcherUpdater', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseEnabledTokensListsUrls.mockReturnValue([ENABLED_LIST_URL])
    mockUseCustomTokensForChain.mockReturnValue([CUSTOM_TOKEN])
  })

  it('forwards enabled list URLs and user custom tokens to the session in normal mode', () => {
    render(<BalancesWatcherUpdater account={ACCOUNT} chainId={SupportedChainId.MAINNET} />)

    expect(lastSessionParams()).toEqual({
      account: ACCOUNT,
      chainId: SupportedChainId.MAINNET,
      tokensListsUrls: [ENABLED_LIST_URL],
      customTokens: [CUSTOM_TOKEN],
    })
  })

  it('treats an explicit isBridgeMode=false the same as the default normal mode', () => {
    render(<BalancesWatcherUpdater account={ACCOUNT} chainId={SupportedChainId.MAINNET} isBridgeMode={false} />)

    expect(lastSessionParams().tokensListsUrls).toEqual([ENABLED_LIST_URL])
    expect(lastSessionParams().customTokens).toEqual([CUSTOM_TOKEN])
  })

  it('queries useCustomTokensForChain with the target chainId', () => {
    render(<BalancesWatcherUpdater account={ACCOUNT} chainId={SupportedChainId.ARBITRUM_ONE} />)

    expect(mockUseCustomTokensForChain).toHaveBeenCalledWith(SupportedChainId.ARBITRUM_ONE)
  })

  it('drops enabled list URLs and user custom tokens in bridge mode, using bridgeTokenList only', () => {
    render(
      <BalancesWatcherUpdater
        account={ACCOUNT}
        chainId={SupportedChainId.ARBITRUM_ONE}
        isBridgeMode
        bridgeTokenList={[BRIDGE_TOKEN]}
      />,
    )

    expect(lastSessionParams()).toEqual({
      account: ACCOUNT,
      chainId: SupportedChainId.ARBITRUM_ONE,
      tokensListsUrls: [],
      customTokens: [BRIDGE_TOKEN],
    })
  })

  it('produces an empty session body in bridge mode when bridgeTokenList is omitted', () => {
    render(<BalancesWatcherUpdater account={ACCOUNT} chainId={SupportedChainId.ARBITRUM_ONE} isBridgeMode />)

    const params = lastSessionParams()
    expect(params.tokensListsUrls).toEqual([])
    expect(params.customTokens).toEqual([])
  })

  it('passes account and chainId through to all child updaters', () => {
    render(<BalancesWatcherUpdater account={ACCOUNT} chainId={SupportedChainId.MAINNET} />)

    expect(mockBalancesResetUpdater).toHaveBeenCalledWith(
      expect.objectContaining({ account: ACCOUNT, chainId: SupportedChainId.MAINNET }),
      undefined,
    )
    expect(mockNativeTokenBalanceUpdater).toHaveBeenCalledWith(
      expect.objectContaining({ account: ACCOUNT, chainId: SupportedChainId.MAINNET }),
      undefined,
    )
    expect(mockBalancesCacheUpdater).toHaveBeenCalledWith(
      expect.objectContaining({ account: ACCOUNT, chainId: SupportedChainId.MAINNET }),
      undefined,
    )
  })

  it('passes an empty excludedTokens Set to BalancesCacheUpdater', () => {
    render(<BalancesWatcherUpdater account={ACCOUNT} chainId={SupportedChainId.MAINNET} />)

    const props = mockBalancesCacheUpdater.mock.calls[0][0] as { excludedTokens: Set<string> }
    expect(props.excludedTokens).toBeInstanceOf(Set)
    expect(props.excludedTokens.size).toBe(0)
  })

  it('forwards an undefined account to the session and child updaters', () => {
    render(<BalancesWatcherUpdater account={undefined} chainId={SupportedChainId.MAINNET} />)

    expect(lastSessionParams().account).toBeUndefined()
    expect(mockBalancesResetUpdater).toHaveBeenCalledWith(expect.objectContaining({ account: undefined }), undefined)
    expect(mockNativeTokenBalanceUpdater).toHaveBeenCalledWith(
      expect.objectContaining({ account: undefined }),
      undefined,
    )
    expect(mockBalancesCacheUpdater).toHaveBeenCalledWith(expect.objectContaining({ account: undefined }), undefined)
  })

  it('keeps the session body reference stable across re-renders when hook outputs are stable', () => {
    const { rerender } = render(<BalancesWatcherUpdater account={ACCOUNT} chainId={SupportedChainId.MAINNET} />)

    const firstBody = lastSessionParams()

    rerender(<BalancesWatcherUpdater account={ACCOUNT} chainId={SupportedChainId.MAINNET} />)

    const secondBody = lastSessionParams()
    expect(secondBody.tokensListsUrls).toBe(firstBody.tokensListsUrls)
    expect(secondBody.customTokens).toBe(firstBody.customTokens)
  })

  it('rebuilds the session body when isBridgeMode toggles', () => {
    const { rerender } = render(<BalancesWatcherUpdater account={ACCOUNT} chainId={SupportedChainId.MAINNET} />)

    expect(lastSessionParams().tokensListsUrls).toEqual([ENABLED_LIST_URL])

    rerender(
      <BalancesWatcherUpdater
        account={ACCOUNT}
        chainId={SupportedChainId.MAINNET}
        isBridgeMode
        bridgeTokenList={[BRIDGE_TOKEN]}
      />,
    )

    expect(lastSessionParams()).toEqual({
      account: ACCOUNT,
      chainId: SupportedChainId.MAINNET,
      tokensListsUrls: [],
      customTokens: [BRIDGE_TOKEN],
    })
  })
})
