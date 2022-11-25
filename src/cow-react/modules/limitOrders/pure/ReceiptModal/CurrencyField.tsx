import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import * as styledEl from './styled'
import { CurrencySelectButton } from '@cow/modules/swap/pure/CurrencySelectButton'
import { formatSmart } from 'utils/format'

interface Props {
  label: string
  token: Token
  amount: CurrencyAmount<Token> | undefined
}

export function CurrencyField({ label, token, amount }: Props) {
  return (
    <styledEl.CurrencyField title={amount?.toExact()} border="rounded-full">
      <styledEl.FieldTitle>{label}</styledEl.FieldTitle>

      <styledEl.FieldBody>
        <CurrencySelectButton readonlyMode={true} loading={false} currency={token} />
        <styledEl.CurrencyValue>{formatSmart(amount)}</styledEl.CurrencyValue>
      </styledEl.FieldBody>
    </styledEl.CurrencyField>
  )
}
