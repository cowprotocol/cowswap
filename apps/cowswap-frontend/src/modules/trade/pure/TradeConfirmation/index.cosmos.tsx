import { inputCurrencyInfoMock, outputCurrencyInfoMock, priceImpactMock } from 'mocks/tradeStateMock'

import { TradeConfirmation } from './index'

const Fixtures = {
  default: () => (
    <TradeConfirmation
      title="Review order"
      account={undefined}
      ensName={undefined}
      inputCurrencyInfo={inputCurrencyInfoMock}
      outputCurrencyInfo={outputCurrencyInfoMock}
      onConfirm={async () => void 0}
      onDismiss={() => void 0}
      isConfirmDisabled={false}
      priceImpact={priceImpactMock}
      recipient={null}
      beforeContent={<span>Trade confirmation</span>}
    />
  ),
}

export default Fixtures
