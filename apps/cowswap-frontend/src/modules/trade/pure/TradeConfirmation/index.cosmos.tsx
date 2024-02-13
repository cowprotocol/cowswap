import React from 'react'

import { inputCurrencyInfoMock, outputCurrencyInfoMock, priceImpactMock } from 'mocks/tradeStateMock'

import { TradeConfirmation } from './index'

const Fixtures = {
  default: (
    <TradeConfirmation
      title="Review order"
      account={undefined}
      inputCurrencyInfo={inputCurrencyInfoMock}
      outputCurrencyInfo={outputCurrencyInfoMock}
      onConfirm={() => void 0}
      onDismiss={() => void 0}
      isConfirmDisabled={false}
      priceImpact={priceImpactMock}
      refreshInterval={10_000}
      recipient={null}
    >
      <span>Trade confirmation</span>
    </TradeConfirmation>
  ),
}

export default Fixtures
