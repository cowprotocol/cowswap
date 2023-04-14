import { CurrencyInputPanel, CurrencyInputPanelProps } from './CurrencyInputPanel'
import { Field } from 'state/swap/actions'
import { COW } from 'constants/tokens'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { useSelect, useValue } from 'react-cosmos/fixture'
import { PriceImpact } from 'hooks/usePriceImpact'
import { defaultCurrencyInputPanelProps } from './defaultCurrencyInputProps'
import { CurrencyPreview } from './CurrencyPreview'

const currency = COW[SupportedChainId.MAINNET]
const defaultProps = defaultCurrencyInputPanelProps

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

const Fixtures = {
  default: <CurrencyInputPanel {...defaultProps} />,
  CurrencyPreview: <CurrencyPreview {...defaultProps} />,
  custom: <Custom />,
}

export default Fixtures
