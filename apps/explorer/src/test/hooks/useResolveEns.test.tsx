import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { act, renderHook, waitFor } from '@testing-library/react'
import { useNetworkId } from 'state/network'

import { useResolveEns } from '../../hooks/useResolveEns'

jest.mock('state/network', () => ({
  useNetworkId: jest.fn(),
}))

jest.mock('../../explorer/api', () => ({
  web3: { eth: { ens: { getAddress: jest.fn() } } },
}))

const mockedUseNetworkId = jest.mocked(useNetworkId)
const { web3 } = jest.requireMock('../../explorer/api') as {
  web3: { eth: { ens: { getAddress: jest.Mock } } }
}

const EVM_ADDRESS = '0x1111111111111111111111111111111111111111'
const SOLANA_ADDRESS = '2c1E71jPXqgM8nJXiQpCEwGhXSVA8GTN4a1qTS1ibyLa'
const ENS_NAME = 'vitalik.eth'

async function resolve(address: string, networkId: SupportedChainId): Promise<string | null | undefined> {
  mockedUseNetworkId.mockReturnValue(networkId)

  const { result } = renderHook(() => useResolveEns(address))

  await waitFor(() => expect(result.current).toBeDefined())

  return result.current?.address
}

describe('useResolveEns', () => {
  beforeEach(() => {
    mockedUseNetworkId.mockReset()
    web3.eth.ens.getAddress.mockReset()
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

  // The network selector preserves the /address/ path across chains, so the same ENS name stays
  // mounted while the chain flips underneath an in-flight lookup.
  it('ignores an ENS result that lands after switching to Solana', async () => {
    let resolveLookup: (address: string) => void = () => undefined
    web3.eth.ens.getAddress.mockReturnValue(
      new Promise<string>((res) => {
        resolveLookup = res
      }),
    )

    mockedUseNetworkId.mockReturnValue(SupportedChainId.MAINNET)
    const { result, rerender } = renderHook(() => useResolveEns(ENS_NAME))

    mockedUseNetworkId.mockReturnValue(SupportedChainId.SOLANA)
    rerender()

    await waitFor(() => expect(result.current?.address).toBeNull())

    await act(async () => {
      resolveLookup(EVM_ADDRESS)
    })

    expect(result.current?.address).toBeNull()
    expect(result.current?.ens).toBeUndefined()
  })
})
