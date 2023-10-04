import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { TokensMap } from '../types'
import { tokensListsEnvironmentAtom } from './tokensListsEnvironmentAtom'
import {
  COW,
  DAI,
  DAI_GOERLI,
  EURE_GNOSIS_CHAIN,
  TokenWithLogo,
  USDC_GNOSIS_CHAIN,
  USDC_GOERLI,
  USDC_MAINNET,
  USDT,
  WBTC,
  WBTC_GNOSIS_CHAIN,
  WETH_GNOSIS_CHAIN,
  WRAPPED_NATIVE_CURRENCY,
} from '@cowprotocol/common-const'

const tokensListToMap = (list: TokenWithLogo[]) =>
  list.reduce<TokensMap>((acc, token) => {
    acc[token.address.toLowerCase()] = {
      chainId: token.chainId,
      address: token.address,
      name: token.name || '',
      decimals: token.decimals,
      symbol: token.symbol || '',
      logoURI: token.logoURI,
    }
    return acc
  }, {})

export const favouriteTokensAtom = atomWithStorage<Record<SupportedChainId, TokensMap>>('favouriteTokensAtom:v1', {
  [SupportedChainId.MAINNET]: tokensListToMap([
    DAI,
    COW[SupportedChainId.MAINNET],
    USDC_MAINNET,
    USDT,
    WBTC,
    WRAPPED_NATIVE_CURRENCY[SupportedChainId.MAINNET],
  ]),
  [SupportedChainId.GNOSIS_CHAIN]: tokensListToMap([
    USDC_GNOSIS_CHAIN,
    COW[SupportedChainId.GNOSIS_CHAIN],
    EURE_GNOSIS_CHAIN,
    WRAPPED_NATIVE_CURRENCY[SupportedChainId.GNOSIS_CHAIN],
    WETH_GNOSIS_CHAIN,
    WBTC_GNOSIS_CHAIN,
  ]),
  [SupportedChainId.GOERLI]: tokensListToMap([
    WRAPPED_NATIVE_CURRENCY[SupportedChainId.GOERLI],
    COW[SupportedChainId.GOERLI],
    DAI_GOERLI,
    USDC_GOERLI,
  ]),
})

export const favouriteTokensListAtom = atom((get) => {
  const { chainId } = get(tokensListsEnvironmentAtom)
  const favouriteTokensState = get(favouriteTokensAtom)

  return Object.values(favouriteTokensState[chainId]).map(
    (token) => new TokenWithLogo(token.logoURI, token.chainId, token.address, token.decimals, token.symbol, token.name)
  )
})
