import { CurrencyInputPanelProps } from '@src/custom/components/CurrencyInputPanel/CurrencyInputPanelMod'
import * as styledEl from './styled'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { GNO_GNOSIS_CHAIN } from 'utils/gnosis_chain/constants'
import { ReceiveAmount } from 'pages/LimitOrder/pureComponents/ReceiveAmount'
import { CurrencyInputPanel } from 'pages/LimitOrder/pureComponents/CurrencyInputPanel'
import { CurrencyArrowSeparator } from 'pages/LimitOrder/pureComponents/CurrencyArrowSeparator'

const defaultProps: CurrencyInputPanelProps = {
  id: 'CurrencyInputPanel',
  value: '1200',
  onUserInput: (value) => {
    // TODO
  },
  currency: GNO_GNOSIS_CHAIN,
  showMaxButton: true,
  balanceAmount: CurrencyAmount.fromRawAmount(GNO_GNOSIS_CHAIN, 250 * 10 ** 18),
}

export function LimitOrderPage() {
  return (
    <styledEl.Container>
      <styledEl.Header>
        <div>Limit Orders</div>
      </styledEl.Header>
      <CurrencyInputPanel currency={defaultProps.currency!} />
      <CurrencyArrowSeparator isLoading={false} />
      <styledEl.DestCurrencyInputPanel currency={defaultProps.currency!} />
      <ReceiveAmount />
    </styledEl.Container>
  )
}
