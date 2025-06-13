import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { CurrencySelectButton } from 'common/pure/CurrencySelectButton'

import * as styledEl from './styled'

interface Props {
  label: string
  token: Token
  amount: CurrencyAmount<Token> | undefined
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
