import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { renderHook, waitFor } from '@testing-library/react'
import { useNetworkId } from 'state/network'

import { useResolveEns } from '../../hooks/useResolveEns'

jest.mock('state/network', () => ({
  useNetworkId: jest.fn(),
}))

jest.mock('../../explorer/api', () => ({
  web3: { eth: { ens: { getAddress: jest.fn() } } },
}))

const mockedUseNetworkId = jest.mocked(useNetworkId)

const EVM_ADDRESS = '0x1111111111111111111111111111111111111111'
const SOLANA_ADDRESS = '2c1E71jPXqgM8nJXiQpCEwGhXSVA8GTN4a1qTS1ibyLa'

async function resolve(address: string, networkId: SupportedChainId): Promise<string | null | undefined> {
  mockedUseNetworkId.mockReturnValue(networkId)

  const { result } = renderHook(() => useResolveEns(address))

  await waitFor(() => expect(result.current).toBeDefined())

  return result.current?.address
}

describe('useResolveEns', () => {
  beforeEach(() => {
    mockedUseNetworkId.mockReset()
  })

  it('accepts a base58 pubkey on Solana', async () => {
    expect(await resolve(SOLANA_ADDRESS, SupportedChainId.SOLANA)).toBe(SOLANA_ADDRESS)
  })

  // Rejecting is what sends the page to the search screen, so the chain has to gate the format.
  it('rejects a base58 pubkey on an EVM chain', async () => {
    expect(await resolve(SOLANA_ADDRESS, SupportedChainId.MAINNET)).toBeNull()
  })

  it('accepts an EVM address on an EVM chain', async () => {
    expect(await resolve(EVM_ADDRESS, SupportedChainId.MAINNET)).toBe(EVM_ADDRESS)
  })

  it('rejects an EVM address on Solana', async () => {
    expect(await resolve(EVM_ADDRESS, SupportedChainId.SOLANA)).toBeNull()
  })
})
