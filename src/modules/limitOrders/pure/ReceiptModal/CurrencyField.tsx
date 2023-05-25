import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import * as styledEl from './styled'
import { CurrencySelectButton } from 'modules/swap/pure/CurrencySelectButton'
import { TokenAmount } from 'common/pure/TokenAmount'

interface Props {
  label: string
  token: Token
  amount: CurrencyAmount<Token> | undefined
}

export function CurrencyField({ label, token, amount }: Props) {
  return (
    <styledEl.CurrencyField title={amount?.toExact()}>
      <b>{label}</b>

      <div>
        <CurrencySelectButton readonlyMode={true} loading={false} currency={token} />
        <styledEl.CurrencyValue>
          <TokenAmount amount={amount} />
        </styledEl.CurrencyValue>
      </div>
    </styledEl.CurrencyField>
  )
}
