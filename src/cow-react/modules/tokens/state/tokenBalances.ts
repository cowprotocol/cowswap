import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { atom } from 'jotai'

export interface TokenBalance {
  balance: CurrencyAmount<Token> | null
  // allowance: string
}

type BalanceKey = string

export function getBalanceKey(chainId: SupportedChainId, tokenAddress: string): BalanceKey {
  return `${chainId}:${tokenAddress}`
}

export const tokenBalancesAtom = atom<{ [key: BalanceKey]: TokenBalance }>({})
