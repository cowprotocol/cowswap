import PROGRESSBAR_COW_SURPLUS_1 from '@cowprotocol/assets/cow-swap/progressbar-finished-image-1.svg'
import PROGRESSBAR_COW_SURPLUS_2 from '@cowprotocol/assets/cow-swap/progressbar-finished-image-2.svg'
import PROGRESSBAR_COW_SURPLUS_3 from '@cowprotocol/assets/cow-swap/progressbar-finished-image-3.svg'
import PROGRESSBAR_COW_SURPLUS_4 from '@cowprotocol/assets/cow-swap/progressbar-finished-image-4.svg'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { OrderProgressBarStepName } from './types'

export const STEPS = [
  {
    title: 'Batching orders',
  },
  {
    title: 'The competition has started',
  },
  { title: 'Executing', description: 'The winner of the competition is now executing your order on-chain.' },
  { title: 'Transaction completed' },
]

export const FINAL_STATES: OrderProgressBarStepName[] = ['expired', 'finished', 'cancelled', 'cancellationFailed']

export const COW_SWAP_BENEFITS = [
  'CoW Swap solvers search Uniswap, 1inch, Matcha, Sushi and more to find you the best price.',
  'CoW Swap sets the standard for protecting against MEV attacks such as frontrunning and sandwiching.',
  'CoW Swap was the first DEX to offer intent-based trading, gasless swaps, coincidences of wants, and many other DeFi innovations.',
  'CoW Swap is the only exchange that matches Coincidences of Wants (CoWs): peer-to-peer swaps that save on settlement costs.',
  'You can avoid price impact on large trades by using TWAP orders on CoW Swap.',
  "Limit orders on CoW Swap capture surplus - so if the price moves in your favor, you're likely to get more than you asked for.",
  "On CoW Swap, you can set limit orders for balances you don't have yet.",
  "Limit orders on CoW Swap are free to place and cancel. That's unique in DeFi!",
  'You can protect all your Ethereum transactions from MEV - not just trades on CoW Swap - by installing MEV Blocker.',
  "Liquidity pools on CoW AMM grow faster than on other AMMs because they don't lose money to arbitrage bots.",
  'CoW Swap has over 20 active solvers - more than any other exchange.',
  "CoW Swap's robust solver competition protects your slippage from being exploited by MEV bots.",
  'Advanced users can create complex, conditional orders directly through CoW Protocol. Read the docs for more info.',
  "Unlike most other exchanges, CoW Swap doesn't charge you any fees if your trade fails.",
]

export const TRADE_ON_NEW_CHAINS_BENEFIT =
  'CoW Swap is now live on Arbitrum and Base. Switch the network toggle in the nav bar for quick, cheap transactions.'

export const CHAIN_SPECIFIC_BENEFITS: Record<SupportedChainId, string[]> = {
  [SupportedChainId.MAINNET]: [TRADE_ON_NEW_CHAINS_BENEFIT, ...COW_SWAP_BENEFITS],
  [SupportedChainId.ARBITRUM_ONE]: COW_SWAP_BENEFITS,
  [SupportedChainId.BASE]: COW_SWAP_BENEFITS,
  [SupportedChainId.GNOSIS_CHAIN]: [TRADE_ON_NEW_CHAINS_BENEFIT, ...COW_SWAP_BENEFITS],
  [SupportedChainId.SEPOLIA]: [TRADE_ON_NEW_CHAINS_BENEFIT, ...COW_SWAP_BENEFITS],
  [SupportedChainId.POLYGON]: COW_SWAP_BENEFITS,
  [SupportedChainId.AVALANCHE]: COW_SWAP_BENEFITS,
}

export const SURPLUS_IMAGES = [
  PROGRESSBAR_COW_SURPLUS_1,
  PROGRESSBAR_COW_SURPLUS_2,
  PROGRESSBAR_COW_SURPLUS_3,
  PROGRESSBAR_COW_SURPLUS_4,
]
