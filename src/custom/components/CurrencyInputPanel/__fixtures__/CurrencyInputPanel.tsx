import CurrencyInputPanel, { CurrencyInputPanelProps } from '../CurrencyInputPanelMod'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { USDC_GOERLI, USDT_GOERLI, WETH_GOERLI } from 'utils/goerli/constants'
import { useSelect, useValue } from 'react-cosmos/fixture'

const defaultProps: CurrencyInputPanelProps = {
  id: 'CurrencyInputPanel',
  value: '1200',
  onUserInput: (value) => {
    //
  },
  currency: WETH_GOERLI,
  showMaxButton: true,
  balanceAmount: CurrencyAmount.fromRawAmount(WETH_GOERLI, 250 * 10 ** 18),
}

const currencies = [WETH_GOERLI, USDT_GOERLI, USDC_GOERLI]
const currenciesSymbols = currencies.map((currency) => currency.symbol || '')

function useCustomProps() {
  const [value, onUserInput] = useValue('value', { defaultValue: defaultProps.value })

  const [balanceAmountRaw] = useValue('balanceAmount', { defaultValue: 250 })
  const balanceAmount = CurrencyAmount.fromRawAmount(defaultProps.currency!, balanceAmountRaw * 10 ** 18)

  const [currencySymbol] = useSelect('Currency', {
    options: currenciesSymbols,
    defaultValue: currenciesSymbols[0],
  })
  const currency = currencies.find((c) => c.symbol === currencySymbol)

  const onMax = () => onUserInput(() => balanceAmountRaw.toString())

  return { value, onUserInput, balanceAmount, currency, onMax }
}

const Custom = () => {
  return <CurrencyInputPanel {...defaultProps} {...useCustomProps()} />
}

export default {
  Default: <CurrencyInputPanel {...defaultProps} />,
  Custom: <Custom />,
}
