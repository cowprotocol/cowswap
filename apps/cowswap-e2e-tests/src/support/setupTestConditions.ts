import { parseUnits } from 'viem'

import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import { resolveToken } from './tokens'

import type { AllowancesMock } from '../mocks/allowances'
import type { BalancesMock } from '../mocks/balances'
import type { TradePage } from '../pages/TradePage'

export type SetupTestConditions = (opts: SetupTestConditionsOptions) => Promise<void>

export interface SetupTestConditionsDeps {
  wallet: { readonly address: string }
  mocks: { balances: BalancesMock; allowances: AllowancesMock }
  swapPage: TradePage
  limitPage: TradePage
  twapPage: TradePage
}

export interface SetupTestConditionsOptions {
  chainId: SupportedChainId
  tradeType: TradeType
  sellToken: string
  buyToken: string
  sellAmount: string
  /** Human-readable amounts keyed by token symbol, e.g. `{ WETH: '1' }` for 1 WETH. */
  balances?: Record<string, string>
  /** Human-readable amounts keyed by token symbol, e.g. `{ WETH: '50' }` for 50 WETH. */
  allowances?: Record<string, string>
}

export type TradeType = 'swap' | 'limitOrder' | 'twap'

export function createSetupTestConditions(deps: SetupTestConditionsDeps): SetupTestConditions {
  const pageByTradeType: Record<TradeType, TradePage> = {
    swap: deps.swapPage,
    limitOrder: deps.limitPage,
    twap: deps.twapPage,
  }

  return async function setupTestConditions(opts: SetupTestConditionsOptions): Promise<void> {
    const { chainId, tradeType, sellToken, buyToken, sellAmount, balances, allowances } = opts

    if (balances) {
      deps.mocks.balances.set(deps.wallet.address, chainId, toRawAtoms(chainId, balances))
    }
    if (allowances) {
      deps.mocks.allowances.set(deps.wallet.address, chainId, toRawAtoms(chainId, allowances))
    }

    const sellAddress = resolveToken(chainId, sellToken).address
    const buyAddress = resolveToken(chainId, buyToken).address

    const page = pageByTradeType[tradeType]
    await page.goto({ chainId, sell: sellAddress, buy: buyAddress })
    await page.enterSellAmount(sellAmount)
    await page.waitForQuote()
  }
}

function toRawAtoms(chainId: SupportedChainId, amounts: Record<string, string>): Record<string, bigint> {
  const result: Record<string, bigint> = {}
  for (const [symbol, amount] of Object.entries(amounts)) {
    const token = resolveToken(chainId, symbol)
    result[token.address] = parseUnits(amount, token.decimals)
  }
  return result
}
