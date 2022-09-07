import { CurrencyInputPanel, CurrencyInputPanelProps } from 'pages/NewSwap/pureComponents/CurrencyInputPanel'
import { Field } from '@src/state/swap/actions'
import { COW } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { useSelect, useValue } from 'react-cosmos/fixture'
import { PriceImpact } from 'hooks/usePriceImpact'

const currency = COW[SupportedChainId.MAINNET]
const balance = CurrencyAmount.fromRawAmount(currency, 250 * 10 ** 18)

const defaultProps: CurrencyInputPanelProps = {
  showSetMax: true,
  allowsOffchainSigning: true,
  currencyInfo: {
    field: Field.INPUT,
    viewAmount: '20',
    receiveAmountInfo: {
      type: 'from',
      amountBeforeFees: '30',
      amountAfterFees: '20',
      feeAmount: '10',
    },
    currency,
    balance,
    fiatAmount: CurrencyAmount.fromRawAmount(currency, 12 * 10 ** 18),
  },
  swapActions: {
    onCurrencySelection() {
      /**/
    },
    onSwitchTokens() {
      /**/
    },
    onUserInput() {
      /**/
    },
    onChangeRecipient() {
      /**/
    },
  },
  priceImpactParams: {
    priceImpact: new Percent(2, 10_000),
    loading: false,
    error: 'fetch-quote-error',
  },
  subsidyAndBalance: {
    subsidy: {
      tier: 2,
      discount: 10,
    },
    balance,
  },
}

function useCustomProps(): Partial<CurrencyInputPanelProps> {
  const [showSetMax] = useValue('showSetMax', { defaultValue: defaultProps.showSetMax })
  const [allowsOffchainSigning] = useValue('allowsOffchainSigning', {
    defaultValue: defaultProps.allowsOffchainSigning,
  })
  const [balanceAmountRaw] = useValue('currencyInfo.balance', { defaultValue: 20 })
  const [fiatAmountRaw] = useValue('currencyInfo.fiatAmount', { defaultValue: 12 })
  const [field] = useSelect('currencyInfo.field', {
    options: [Field.INPUT, Field.OUTPUT],
    defaultValue: Field.INPUT,
  })
  const [priceImpactError] = useSelect('priceImpactParams.error', {
    options: ['fetch-quote-error', 'insufficient-liquidity', 'fee-exceeds-sell-amount'],
    defaultValue: 'fetch-quote-error',
  })
  const [viewAmount] = useValue('currencyInfo.viewAmount', { defaultValue: defaultProps.currencyInfo.viewAmount })
  const [priceImpactRaw] = useValue('priceImpactParams.priceImpact', { defaultValue: 2 })

  const balance = CurrencyAmount.fromRawAmount(currency, balanceAmountRaw * 10 ** 18)
  const fiatAmount = CurrencyAmount.fromRawAmount(currency, fiatAmountRaw * 10 ** 18)
  const priceImpact = new Percent(priceImpactRaw, 10_000)

  const currencyInfo = {
    ...defaultProps.currencyInfo,
    field,
    balance,
    viewAmount,
    fiatAmount,
  }

  const priceImpactParams: PriceImpact = {
    priceImpact,
    error: priceImpactError,
    loading: useValue('priceImpactParams.loading', { defaultValue: false })[0],
  }

  const subsidyAndBalance = {
    subsidy: {
      tier: useValue('subsidyAndBalance.tier', { defaultValue: 2 })[0],
      discount: useValue('subsidyAndBalance.discount', { defaultValue: 10 })[0],
    },
    balance,
  }

  return { allowsOffchainSigning, showSetMax, currencyInfo, priceImpactParams, subsidyAndBalance }
}

const Custom = () => {
  return <CurrencyInputPanel {...defaultProps} {...useCustomProps()} />
}

export default {
  Default: <CurrencyInputPanel {...defaultProps} />,
  Custom: <Custom />,
}
