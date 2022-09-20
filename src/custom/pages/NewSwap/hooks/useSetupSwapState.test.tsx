import { unmountComponentAtNode } from 'react-dom'
import { useSetupSwapState } from 'pages/NewSwap/hooks/useSetupSwapState'
import { useSwapState } from 'state/swap/hooks'
import { waitFor } from '@testing-library/react'
import { mockedConnector, mockedWeb3Render } from 'test-utils'
import { createHashHistory } from 'history'
import { Field, replaceSwapState, ReplaceSwapStatePayload } from '@src/state/swap/actions'
import store from 'state'

function TestComponent() {
  useSetupSwapState()
  const swapState = useSwapState()

  return <div id="result">{JSON.stringify(swapState)}</div>
}

describe('useSetupSwapState() - hook to setup a swap state considering URL and localStorage', () => {
  const history = createHashHistory()

  let container: HTMLDivElement | undefined = undefined

  function setWeb3Context(chainId = 1, account = '0x3a7dc718eaf31f0a55988161f3d75d7ca785b034') {
    mockedConnector.getActions().update({
      chainId,
      accounts: [account],
    })
  }

  function resetWeb3Context() {
    mockedConnector.getActions().resetState()
  }

  function getRenderedState() {
    return JSON.parse(container?.querySelector('#result')?.textContent || '{}')
  }

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    resetWeb3Context()
    history.push('/swap')
    store.dispatch(
      replaceSwapState({
        chainId: null,
        independentField: Field.OUTPUT,
        typedValue: '',
        inputCurrencyId: undefined,
        outputCurrencyId: undefined,
        recipient: null,
      })
    )

    if (!container) return

    unmountComponentAtNode(container)
    container.remove()
    container = undefined
  })

  it('When web3 context is not set, then the swap state should be empty', async () => {
    mockedWeb3Render(<TestComponent />, container)

    await waitFor(() => {
      expect(getRenderedState()).toEqual({
        INPUT: {
          currencyId: 'ETH',
        },
        OUTPUT: {
          currencyId: null,
        },
        chainId: null,
        independentField: 'INPUT',
        recipient: null,
        typedValue: '',
      })
    })
  })

  it('When chainId changed, should reset the swap state regarding a new chainId', async () => {
    setWeb3Context(137) // Polygon

    mockedWeb3Render(<TestComponent />, container)

    await waitFor(() => {
      expect(getRenderedState()).toEqual({
        INPUT: {
          currencyId: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
        },
        OUTPUT: {
          currencyId: null,
        },
        chainId: 137,
        independentField: 'INPUT',
        recipient: null,
        typedValue: '1',
      })
    })

    setWeb3Context(1) // Ethereum mainnet

    await waitFor(() => {
      expect(getRenderedState()).toEqual({
        INPUT: {
          currencyId: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        },
        OUTPUT: {
          currencyId: null,
        },
        chainId: 1,
        independentField: 'INPUT',
        recipient: null,
        typedValue: '1',
      })
    })
  })

  it('When URL changed, should fill the swap state regarding a new URL params', async () => {
    setWeb3Context(1) // Ethereum mainnet
    const urlState = {
      inputCurrency: 'USDT',
      outputCurrency: 'DAI',
      amount: '230',
      recipient: '0xA4a5EF3661A7e8F58536938f268d5712ebe0Eb91',
      independentField: 'output',
    }
    history.push('/swap?' + new URLSearchParams(urlState))
    mockedWeb3Render(<TestComponent />, container)

    await waitFor(() => {
      expect(getRenderedState()).toEqual({
        INPUT: {
          currencyId: urlState.inputCurrency,
        },
        OUTPUT: {
          currencyId: urlState.outputCurrency,
        },
        chainId: 1,
        independentField: 'OUTPUT',
        recipient: urlState.recipient,
        typedValue: urlState.amount,
      })
    })

    const newUrlState = {
      inputCurrency: 'ELON',
      outputCurrency: 'PEAK',
      amount: '20',
      recipient: '',
      independentField: 'input',
    }
    history.push('/swap?' + new URLSearchParams(newUrlState))

    await waitFor(() => {
      expect(getRenderedState()).toEqual({
        INPUT: {
          currencyId: newUrlState.inputCurrency,
        },
        OUTPUT: {
          currencyId: newUrlState.outputCurrency,
        },
        chainId: 1,
        independentField: 'INPUT',
        recipient: urlState.recipient,
        typedValue: newUrlState.amount,
      })
    })
  })

  describe('When web3 context is set', () => {
    it('And there are no URL params and no persisted swap state, then the swap state should be filled by default', async () => {
      setWeb3Context(137) // polygon
      mockedWeb3Render(<TestComponent />, container)

      await waitFor(() => {
        expect(getRenderedState()).toEqual({
          INPUT: {
            currencyId: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
          },
          OUTPUT: {
            currencyId: null,
          },
          chainId: 137,
          independentField: 'INPUT',
          recipient: null,
          typedValue: '1',
        })
      })
    })

    it('And there are valid URL params, then should fill the swap state regarding URL', async () => {
      setWeb3Context(1) // Ethereum mainnet
      const urlState = {
        inputCurrency: 'USDT',
        outputCurrency: 'DAI',
        amount: '230',
        recipient: '0xA4a5EF3661A7e8F58536938f268d5712ebe0Eb91',
        independentField: 'output',
      }
      history.push('/swap?' + new URLSearchParams(urlState))
      mockedWeb3Render(<TestComponent />, container)

      await waitFor(() => {
        expect(getRenderedState()).toEqual({
          INPUT: {
            currencyId: urlState.inputCurrency,
          },
          OUTPUT: {
            currencyId: urlState.outputCurrency,
          },
          chainId: 1,
          independentField: 'OUTPUT',
          recipient: urlState.recipient,
          typedValue: urlState.amount,
        })
      })
    })

    it('And there is no URL params and there is a persisted swap state, then should fill the swap state with a cache', async () => {
      setWeb3Context(56) // BSC
      const cachedSwapState: ReplaceSwapStatePayload = {
        chainId: 56,
        independentField: Field.OUTPUT,
        typedValue: '666',
        inputCurrencyId: 'COW',
        outputCurrencyId: 'WBTC',
        recipient: '0x2222Bca1f2de4661ED88A30C99A7a9449Aa44444',
      }
      store.dispatch(replaceSwapState(cachedSwapState))

      mockedWeb3Render(<TestComponent />, container)

      await waitFor(() => {
        expect(getRenderedState()).toEqual({
          INPUT: {
            currencyId: cachedSwapState.inputCurrencyId,
          },
          OUTPUT: {
            currencyId: cachedSwapState.outputCurrencyId,
          },
          chainId: cachedSwapState.chainId,
          independentField: cachedSwapState.independentField,
          recipient: cachedSwapState.recipient,
          typedValue: cachedSwapState.typedValue,
        })
      })
    })
  })
})
