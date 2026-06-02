import type { ReactNode } from 'react'

import { TokenListControl } from '../../../controls/TokenListControl'
import { CurrencyInputControl } from '../../../ui/inputs/CurrencyInput/CurrencyInputControl'

import type { ConfiguratorFormChangeHandler, ConfiguratorFormValues } from '../section.types'

interface TokensSectionFormProps {
  values: ConfiguratorFormValues
  onChange: ConfiguratorFormChangeHandler
}

export function TokensSectionForm({ values, onChange }: TokensSectionFormProps): ReactNode {
  return (
    <>
      <CurrencyInputControl
        label="Sell token"
        name="sellToken"
        tokenValue={values.sellToken}
        tokenAmountValue={values.sellTokenAmount}
        onChange={onChange}
      />
      <CurrencyInputControl
        label="Buy token"
        name="buyToken"
        tokenValue={values.buyToken}
        tokenAmountValue={values.buyTokenAmount}
        onChange={onChange}
      />
      <TokenListControl tokenListUrls={values.tokenListUrls} customTokens={values.customTokens} onChange={onChange} />
    </>
  )
}
