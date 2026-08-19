import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { multiChainBalancesAtom, multiChainModeActiveAtom } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { tokensBySymbolAllChainsAtom } from '../state/tokensBySymbolAllChainsAtom'

export interface CrossChainBalanceInfo {
  totalAmount: CurrencyAmount<Token>
  perNetwork: CrossChainBalancePerNetwork[]
}

export interface CrossChainBalancePerNetwork {
  chainId: SupportedChainId
  token: TokenWithLogo
  amount: CurrencyAmount<Token>
}

interface ChainWithBalance {
  chainId: SupportedChainId
  token: TokenWithLogo
  balance: bigint
}

const EMPTY_CHAINS_WITH_BALANCE: ChainWithBalance[] = []

/**
 * Cross-chain balance breakdown for `token`'s symbol, keyed by every EVM chain
 * where the aggregator reports a non-zero balance. Returns `null` when
 * multichain mode is off, or when the symbol has no balance on any chain —
 * callers should render exactly today's single-chain row in that case.
 */
export function useCrossChainBalances(token: TokenWithLogo): CrossChainBalanceInfo | null {
  const multiChainModeActive = useAtomValue(multiChainModeActiveAtom)
  const multiChainBalances = useAtomValue(multiChainBalancesAtom)
  const tokensBySymbolAllChains = useAtomValue(tokensBySymbolAllChainsAtom)

  const symbolGroup = token.symbol ? tokensBySymbolAllChains[token.symbol.toUpperCase()] : undefined

  const chainsWithBalance = useMemo(() => {
    if (!multiChainModeActive || !symbolGroup) return EMPTY_CHAINS_WITH_BALANCE

    const list: ChainWithBalance[] = []
    for (const entry of Object.entries(symbolGroup)) {
      const chainId = Number(entry[0]) as SupportedChainId
      const siblingToken = entry[1]
      if (!siblingToken) continue

      const balance = multiChainBalances[chainId]?.[getAddressKey(siblingToken.address)]
      if (balance !== undefined && balance > 0n) {
        list.push({ chainId, token: siblingToken, balance })
      }
    }
    return list
  }, [multiChainModeActive, symbolGroup, multiChainBalances])

  return useMemo(() => {
    if (chainsWithBalance.length === 0) return null

    return { totalAmount: sumAcrossDecimals(chainsWithBalance), perNetwork: buildPerNetwork(chainsWithBalance) }
  }, [chainsWithBalance])
}

function buildPerNetwork(chainsWithBalance: ChainWithBalance[]): CrossChainBalancePerNetwork[] {
  return chainsWithBalance.map(({ chainId, token, balance }) => ({
    chainId,
    token,
    amount: CurrencyAmount.fromRawAmount(token, balance.toString()),
  }))
}

/**
 * Same symbol can have different `decimals` on different chains (e.g. a
 * bridged variant that wasn't re-deployed with the canonical precision).
 * Summing raw balances directly would silently misrepresent the total, so
 * every chain's raw balance is scaled up to the highest decimals seen across
 * the group before summing, and that same token is reused as the total's
 * currency so the result renders at the correct precision.
 */
function sumAcrossDecimals(chainsWithBalance: ChainWithBalance[]): CurrencyAmount<Token> {
  const maxDecimalsEntry = chainsWithBalance.reduce((max, entry) =>
    entry.token.decimals > max.token.decimals ? entry : max,
  )
  const maxDecimals = maxDecimalsEntry.token.decimals

  const totalRaw = chainsWithBalance.reduce((sum, { token, balance }) => {
    const scale = 10n ** BigInt(maxDecimals - token.decimals)
    return sum + balance * scale
  }, 0n)

  return CurrencyAmount.fromRawAmount(maxDecimalsEntry.token, totalRaw.toString())
}
