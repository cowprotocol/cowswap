import React from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import { updateWeb3Provider } from '../../api/web3'
import { web3 } from '../../explorer/api'
import { rootReducer } from '../../explorer/state'
import { withGlobalContext } from '../../hooks/useGlobalState'
import { useNetworkId } from '../../state/network/hooks'
import { NetworkUpdater } from '../../state/network/NetworkUpdater'
import { Theme } from '../../theme/types'

jest.mock('../../api/web3', () => ({
  updateWeb3Provider: jest.fn(),
}))

jest.mock('../../explorer/api', () => ({
  web3: {},
}))

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

function NetworkIdProbe(): React.ReactNode {
  const networkId = useNetworkId()
  return <span data-testid="network-id">{networkId === null ? 'null' : String(networkId)}</span>
}

const NetworkUpdaterHarness: React.FC = () => (
  <>
    <NetworkUpdater />
    <NetworkIdProbe />
  </>
)

function renderHarness(pathname: string, networkId: number | null): void {
  const Wrapped = withGlobalContext(NetworkUpdaterHarness, createInitialState(networkId), rootReducer)

  render(
    <MemoryRouter initialEntries={[pathname]}>
      <Wrapped />
    </MemoryRouter>,
  )
}

describe('NetworkUpdater', () => {
  beforeEach(() => {
    mockedUpdateWeb3Provider.mockReset()
  })

  it('preserves currently selected network on canonical solvers route', async () => {
    renderHarness('/solvers', SupportedChainId.ARBITRUM_ONE)

    await waitFor(() => {
      expect(screen.getByTestId('network-id').textContent).toBe(String(SupportedChainId.ARBITRUM_ONE))
    })

    expect(mockedUpdateWeb3Provider).not.toHaveBeenCalled()
  })

  it('still derives network from prefixed routes', async () => {
    const baseAlias = CHAIN_INFO[SupportedChainId.BASE].urlAlias
    renderHarness(`/${baseAlias}/solvers`, SupportedChainId.MAINNET)

    await waitFor(() => {
      expect(screen.getByTestId('network-id').textContent).toBe(String(SupportedChainId.BASE))
    })

    expect(mockedUpdateWeb3Provider).toHaveBeenCalledWith(web3, SupportedChainId.BASE)
  })
})
