import { Token } from '@uniswap/sdk-core'
import * as styledEl from './styled'
import { CurrencySelectButton } from '@cow/modules/swap/pure/CurrencySelectButton'

interface Props {
  label: string
  token: Token
  amount: string | number | undefined
}

export function CurrencyField({ label, token, amount }: Props) {
  return (
    <styledEl.CurrencyField border="rounded-full">
      <styledEl.FieldTitle>{label}</styledEl.FieldTitle>

      <styledEl.FieldBody>
        <CurrencySelectButton readonlyMode={true} loading={false} currency={token} />
        <styledEl.CurrencyValue>{amount}</styledEl.CurrencyValue>
      </styledEl.FieldBody>
    </styledEl.CurrencyField>
  )
}
