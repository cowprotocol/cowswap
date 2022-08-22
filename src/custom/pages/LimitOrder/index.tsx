import * as styledEl from './styled'
import { GNO_GNOSIS_CHAIN, WETH_GNOSIS_CHAIN } from 'utils/gnosis_chain/constants'
import { ReceiveAmount } from './pureComponents/ReceiveAmount'
import { CurrencyInputPanel } from './pureComponents/CurrencyInputPanel'
import { CurrencyArrowSeparator } from './pureComponents/CurrencyArrowSeparator'
import { TradeRates } from './pureComponents/TradeRates'
import { TradeButton } from './pureComponents/TradeButton'

export function LimitOrderPage() {
  return (
    <styledEl.Container>
      <styledEl.Header>
        <div>Limit Orders</div>
      </styledEl.Header>
      <CurrencyInputPanel currency={GNO_GNOSIS_CHAIN} />
      <CurrencyArrowSeparator isLoading={false} />
      <styledEl.DestCurrencyInputPanel currency={WETH_GNOSIS_CHAIN} />
      <ReceiveAmount />
      <TradeRates />
      <TradeButton>Trade</TradeButton>
    </styledEl.Container>
  )
}
