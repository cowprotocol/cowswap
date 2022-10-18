import { initSwapStateFromUrl } from './initSwapStateFromUrl'
import { Field } from 'state/swap/actions'
import { SwapState } from 'state/swap/reducer'
import { WRAPPED_NATIVE_CURRENCY as WETH } from 'constants/tokens'
import { TradeStateFromUrl } from '@cow/modules/swap/containers/NewSwapWidget/typings'

describe('initSwapStateFromUrl() - builds a swap state considering URL params, persisted redux state and default values', () => {
  it('When URL contains valid values, then should apply them to the state', () => {
    const stateFromUrl: TradeStateFromUrl = {
      inputCurrency: 'USDT',
      outputCurrency: 'ETH',
      amount: '20',
      independentField: 'output',
      recipient: '0x86b8a3a6d8ac45ac6a902c9e6c396285bedf0417',
    }

    const state = initSwapStateFromUrl(1, stateFromUrl, null)

    expect(state.inputCurrencyId).toBe(stateFromUrl.inputCurrency)
    expect(state.outputCurrencyId).toBe(stateFromUrl.outputCurrency)
    expect(state.typedValue).toBe(stateFromUrl.amount)
    expect(state.recipient?.toLowerCase()).toBe(stateFromUrl.recipient?.toLowerCase())
    expect(state.independentField).toBe(Field.OUTPUT)
  })

  it("When URL DOESN'T contains valid values, then should fallback to persisted state values", () => {
    const stateFromUrl: TradeStateFromUrl = {
      inputCurrency: null,
      outputCurrency: null,
      amount: null,
      independentField: null,
      recipient: '---',
    }

    const persistedState: SwapState = {
      chainId: 1,
      independentField: Field.INPUT,
      recipient: '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f',
      typedValue: '32',
      [Field.INPUT]: {
        currencyId: 'DAI',
      },
      [Field.OUTPUT]: {
        currencyId: 'COW',
      },
    }

    const state = initSwapStateFromUrl(1, stateFromUrl, persistedState)

    expect(state.inputCurrencyId).toBe(persistedState.INPUT.currencyId)
    expect(state.outputCurrencyId).toBe(persistedState.OUTPUT.currencyId)
    expect(state.typedValue).toBe(persistedState.typedValue)
    expect(state.recipient).toBe(persistedState.recipient)
    expect(state.independentField).toBe(persistedState.independentField)
  })

  it("When URL and Persisted state DON'T contain valid values, then should fallback to default values", () => {
    const chainId = 1

    const stateFromUrl: TradeStateFromUrl = {
      inputCurrency: null,
      outputCurrency: null,
      amount: null,
      independentField: null,
      recipient: '---',
    }

    const state = initSwapStateFromUrl(chainId, stateFromUrl, null)

    expect(state.inputCurrencyId).toBe(WETH[chainId]?.address)
    expect(state.outputCurrencyId).toBe(undefined)
    expect(state.typedValue).toBe('')
    expect(state.recipient).toBe(null)
    expect(state.independentField).toBe(Field.INPUT)
  })
})
