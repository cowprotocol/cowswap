import React from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { useAvailableChains } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router'

import { updateWeb3Provider } from '../../api/web3'
import { NetworkSelector } from '../../components/NetworkSelector/NetworkSelector.container'
import { web3 } from '../../explorer/api'
import { rootReducer } from '../../explorer/state'
import { withGlobalContext } from '../../hooks/useGlobalState'
import { useNetworkId } from '../../state/network/hooks'
import { NetworkUpdater } from '../../state/network/NetworkUpdater'
import { Theme } from '../../theme/types'

jest.mock('@cowprotocol/common-hooks', () => ({
  useAvailableChains: jest.fn(),
}))

jest.mock('../../api/web3', () => ({
  updateWeb3Provider: jest.fn(),
}))

jest.mock('../../explorer/api', () => ({
  web3: {},
}))

const mockedUseAvailableChains = jest.mocked(useAvailableChains)
const mockedUpdateWeb3Provider = jest.mocked(updateWeb3Provider)

type TestState = {
  theme: Theme
  networkId: number | null
}

function createInitialState(networkId: number | null): () => TestState {
  return () => ({
    theme: Theme.DARK,
    networkId,
  })
}

function LocationProbe(): React.ReactNode {
  const location = useLocation()
  return <span data-testid="location">{location.pathname}</span>
}

function NetworkIdProbe(): React.ReactNode {
  const networkId = useNetworkId()
  return <span data-testid="network-id">{networkId === null ? 'null' : String(networkId)}</span>
}

function SelectorFromState(): React.ReactNode {
  const networkId = useNetworkId()
  if (networkId === null) return null

  return <NetworkSelector networkId={networkId} />
}

const SelectorHarness: React.FC = () => (
  <>
    <NetworkUpdater />
    <SelectorFromState />
    <NetworkIdProbe />
    <LocationProbe />
  </>
)

describe('NetworkSelector on /solvers', () => {
  beforeEach(() => {
    mockedUseAvailableChains.mockReset()
    mockedUpdateWeb3Provider.mockReset()
  })

  it('updates selected network and keeps solvers route prefixed to the selected chain', async () => {
    mockedUseAvailableChains.mockReturnValue([SupportedChainId.MAINNET, SupportedChainId.ARBITRUM_ONE])

    const Wrapped = withGlobalContext(SelectorHarness, createInitialState(SupportedChainId.MAINNET), rootReducer)

    render(
      <MemoryRouter initialEntries={['/solvers']}>
        <Wrapped />
      </MemoryRouter>,
    )

    const mainnetLabel = CHAIN_INFO[SupportedChainId.MAINNET].label.toLowerCase()
    const arbitrumLabel = CHAIN_INFO[SupportedChainId.ARBITRUM_ONE].label

    fireEvent.click(screen.getByText(mainnetLabel))
    fireEvent.click(screen.getByText(arbitrumLabel))

    await waitFor(() => {
      expect(screen.getByTestId('network-id').textContent).toBe(String(SupportedChainId.ARBITRUM_ONE))
    })

    expect(screen.getByTestId('location').textContent).toBe(
      `/${CHAIN_INFO[SupportedChainId.ARBITRUM_ONE].urlAlias}/solvers`,
    )
    expect(mockedUpdateWeb3Provider).toHaveBeenCalledWith(web3, SupportedChainId.ARBITRUM_ONE)
  })

  it('updates selected network on trailing-slash solvers route', async () => {
    mockedUseAvailableChains.mockReturnValue([SupportedChainId.MAINNET, SupportedChainId.ARBITRUM_ONE])

    const Wrapped = withGlobalContext(SelectorHarness, createInitialState(SupportedChainId.MAINNET), rootReducer)

    render(
      <MemoryRouter initialEntries={['/solvers/']}>
        <Wrapped />
      </MemoryRouter>,
    )

    const mainnetLabel = CHAIN_INFO[SupportedChainId.MAINNET].label.toLowerCase()
    const arbitrumLabel = CHAIN_INFO[SupportedChainId.ARBITRUM_ONE].label

    fireEvent.click(screen.getByText(mainnetLabel))
    fireEvent.click(screen.getByText(arbitrumLabel))

    await waitFor(() => {
      expect(screen.getByTestId('network-id').textContent).toBe(String(SupportedChainId.ARBITRUM_ONE))
    })

    expect(screen.getByTestId('location').textContent).toBe(
      `/${CHAIN_INFO[SupportedChainId.ARBITRUM_ONE].urlAlias}/solvers`,
    )
    expect(mockedUpdateWeb3Provider).toHaveBeenCalledWith(web3, SupportedChainId.ARBITRUM_ONE)
  })
})
