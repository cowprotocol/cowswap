// a list of tokens by chain

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, Token } from '@uniswap/sdk-core'

import {
  AMPL,
  COW,
  DAI,
  ETH2X_FLI,
  FEI,
  FRAX,
  FXS,
  renBTC,
  rETH2,
  sETH2,
  SWISE,
  TRIBE,
  USDC_MAINNET,
  USDT,
  WBTC,
  WRAPPED_NATIVE_CURRENCY,
} from 'legacy/constants/tokens'
import { USDC_GNOSIS_CHAIN, WBTC_GNOSIS_CHAIN, WETH_GNOSIS_CHAIN } from 'legacy/utils/gnosis_chain/constants'
import { DAI_GOERLI, USDC_GOERLI } from 'legacy/utils/goerli/constants'

type ChainTokenList = {
  readonly [chainId: number]: Token[]
}

type ChainCurrencyList = {
  readonly [chainId: number]: Currency[]
}

const WRAPPED_NATIVE_CURRENCIES_ONLY: ChainTokenList = Object.fromEntries(
  Object.entries(WRAPPED_NATIVE_CURRENCY)
    .map(([key, value]) => [key, [value]])
    .filter(Boolean)
)

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WRAPPED_NATIVE_CURRENCIES_ONLY,
  [SupportedChainId.MAINNET]: [
    ...WRAPPED_NATIVE_CURRENCIES_ONLY[SupportedChainId.MAINNET],
    DAI,
    USDC_MAINNET,
    USDT,
    WBTC,
  ],
}
export const ADDITIONAL_BASES: { [chainId: number]: { [tokenAddress: string]: Token[] } } = {
  [SupportedChainId.MAINNET]: {
    '0xF16E4d813f4DcfDe4c5b44f305c908742De84eF0': [ETH2X_FLI],
    [rETH2.address]: [sETH2],
    [SWISE.address]: [sETH2],
    [FEI.address]: [TRIBE],
    [TRIBE.address]: [FEI],
    [FRAX.address]: [FXS],
    [FXS.address]: [FRAX],
    [WBTC.address]: [renBTC],
    [renBTC.address]: [WBTC],
  },
}
/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId: number]: { [tokenAddress: string]: Token[] } } = {
  [SupportedChainId.MAINNET]: {
    [AMPL.address]: [DAI, WRAPPED_NATIVE_CURRENCY[SupportedChainId.MAINNET] as Token],
  },
}

/**
 * Shows up in the currency select for swap and add liquidity
 */
export const COMMON_BASES: ChainCurrencyList = {
  [SupportedChainId.MAINNET]: [
    DAI,
    COW[SupportedChainId.MAINNET],
    USDC_MAINNET,
    USDT,
    WBTC,
    WRAPPED_NATIVE_CURRENCY[SupportedChainId.MAINNET],
  ],
  [SupportedChainId.GOERLI]: [
    WRAPPED_NATIVE_CURRENCY[SupportedChainId.GOERLI],
    COW[SupportedChainId.GOERLI],
    DAI_GOERLI,
    USDC_GOERLI,
  ],
  [SupportedChainId.GNOSIS_CHAIN]: [
    USDC_GNOSIS_CHAIN,
    WBTC_GNOSIS_CHAIN,
    COW[SupportedChainId.GNOSIS_CHAIN],
    WBTC_GNOSIS_CHAIN,
    WETH_GNOSIS_CHAIN,
    WRAPPED_NATIVE_CURRENCY[SupportedChainId.GNOSIS_CHAIN],
  ],
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WRAPPED_NATIVE_CURRENCIES_ONLY,
  [SupportedChainId.MAINNET]: [
    ...WRAPPED_NATIVE_CURRENCIES_ONLY[SupportedChainId.MAINNET],
    DAI,
    USDC_MAINNET,
    USDT,
    WBTC,
  ],
}
export const PINNED_PAIRS: { readonly [chainId: number]: [Token, Token][] } = {
  [SupportedChainId.MAINNET]: [
    [
      new Token(SupportedChainId.MAINNET, '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', 8, 'cDAI', 'Compound Dai'),
      new Token(
        SupportedChainId.MAINNET,
        '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
        8,
        'cUSDC',
        'Compound USD Coin'
      ),
    ],
    [USDC_MAINNET, USDT],
    [DAI, USDT],
  ],
}
