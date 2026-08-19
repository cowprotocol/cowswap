import { atom } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

/**
 * Live, in-memory ERC20 balances for every EVM chain at once, fed by the
 * balances-aggregator session. Unlike `balancesAtom` (single active chain),
 * this is additive across chains and is never reset on chain switch — only on
 * account change (see `MultiChainBalancesUpdater`).
 */
export type MultiChainBalances = Partial<Record<SupportedChainId, Record<TokenAddress, bigint>>>

type TokenAddress = string

export const multiChainBalancesAtom = atom<MultiChainBalances>({})
