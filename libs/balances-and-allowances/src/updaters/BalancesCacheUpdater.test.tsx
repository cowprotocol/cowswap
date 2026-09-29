import { Provider, useAtomValue } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import React, { ReactNode } from 'react'

import { getAddressKey, mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

import { renderHook, waitFor } from '@testing-library/react'

import { BalancesCacheUpdater } from './BalancesCacheUpdater'

import { balancesAtom, balancesCacheAtom, BalancesState, DEFAULT_BALANCES_STATE } from '../state/balancesAtom'

// Mixed-case Solana pubkey: lowercasing it would alias a different owner and corrupt the cache bucket.
const SOLANA_ACCOUNT = 'So11111111111111111111111111111111111111112'
const MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

type BalancesCache = ReturnType<typeof useAtomValue<typeof balancesCacheAtom>>

let hydrateBalances: BalancesState
let hydrateCache: BalancesCache

function HydrateAtoms({ children }: { children: ReactNode }): ReactNode {
  useHydrateAtoms([
    [balancesAtom, hydrateBalances],
    [balancesCacheAtom, hydrateCache],
  ])
  return <>{children}</>
}

function wrapper({ children }: { children: ReactNode }): ReactNode {
  return (
    <Provider>
      <HydrateAtoms>{children}</HydrateAtoms>
    </Provider>
  )
}

describe('BalancesCacheUpdater (Solana account keys)', () => {
  it('persists the cache under the case-sensitive account key, not a lowercased alias', async () => {
    hydrateBalances = {
      ...DEFAULT_BALANCES_STATE,
      chainId: SupportedChainId.SOLANA,
      values: { [getAddressKey(MINT)]: 100n },
    }
    hydrateCache = mapSupportedNetworks({})

    const { result } = renderHook(
      () => {
        BalancesCacheUpdater({ chainId: SupportedChainId.SOLANA, account: SOLANA_ACCOUNT, excludedTokens: new Set() })
        return useAtomValue(balancesCacheAtom)
      },
      { wrapper },
    )

    await waitFor(() => expect(result.current[SupportedChainId.SOLANA]?.[getAddressKey(SOLANA_ACCOUNT)]).toBeDefined())

    expect(SOLANA_ACCOUNT).not.toBe(SOLANA_ACCOUNT.toLowerCase())
    expect(result.current[SupportedChainId.SOLANA]?.[SOLANA_ACCOUNT.toLowerCase()]).toBeUndefined()
    expect(result.current[SupportedChainId.SOLANA]?.[getAddressKey(SOLANA_ACCOUNT)]?.[getAddressKey(MINT)]).toBe('100')
  })

  it('restores balances from a cache stored under the case-sensitive account key', async () => {
    hydrateBalances = { ...DEFAULT_BALANCES_STATE }
    hydrateCache = mapSupportedNetworks({})
    hydrateCache[SupportedChainId.SOLANA] = {
      [getAddressKey(SOLANA_ACCOUNT)]: { [getAddressKey(MINT)]: '250' },
    }

    const { result } = renderHook(
      () => {
        BalancesCacheUpdater({ chainId: SupportedChainId.SOLANA, account: SOLANA_ACCOUNT, excludedTokens: new Set() })
        return useAtomValue(balancesAtom)
      },
      { wrapper },
    )

    await waitFor(() => expect(result.current.values[getAddressKey(MINT)]).toBe(250n))
    expect(result.current.fromCache).toBe(true)
  })
})
