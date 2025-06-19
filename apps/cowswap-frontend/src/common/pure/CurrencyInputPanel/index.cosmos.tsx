import { COW_TOKEN_TO_CHAIN } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { DemoContainer } from 'cosmos.decorator'
import { useSelect, useValue } from 'react-cosmos/client'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { Field } from 'legacy/state/types'

import { CurrencyInputPanel, CurrencyInputPanelProps } from './CurrencyInputPanel'
import { defaultCurrencyInputPanelProps } from './defaultCurrencyInputProps'

import { CurrencyAmountPreview } from '../CurrencyAmountPreview'

const currency = COW_TOKEN_TO_CHAIN[SupportedChainId.MAINNET]
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

  const [priceImpactRaw] = useValue('priceImpactParams.priceImpact', { defaultValue: 2 })

  const balance = currency ? CurrencyAmount.fromRawAmount(currency, balanceAmountRaw * 10 ** 18) : null
  const fiatAmount = currency ? CurrencyAmount.fromRawAmount(currency, fiatAmountRaw * 10 ** 18) : null
  const priceImpact = new Percent(priceImpactRaw, 10_000)

  const currencyInfo = {
    ...defaultProps.currencyInfo,
    field,
    balance,
    isIndependent: false,
    fiatAmount,
  }

  const priceImpactParams: PriceImpact = {
    priceImpact,
    loading: useValue('priceImpactParams.loading', { defaultValue: false })[0],
  }

  const subsidyAndBalance = {
    subsidy: {
      tier: useValue('subsidyAndBalance.tier', { defaultValue: 2 })[0],
      discount: useValue('subsidyAndBalance.discount', { defaultValue: 10 })[0],
    },
    balance: balance ?? undefined,
  }

  return { allowsOffchainSigning, showSetMax, currencyInfo, priceImpactParams, subsidyAndBalance }
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const Custom = () => {
  return (
    <DemoContainer>
      <CurrencyInputPanel {...defaultProps} {...useCustomProps()} />
    </DemoContainer>
  )
}

const Fixtures = {
  default: () => <CurrencyInputPanel {...defaultProps} />,
  CurrencyPreview: () => <CurrencyAmountPreview {...defaultProps} />,
  custom: () => <Custom />,
}

export default Fixtures
