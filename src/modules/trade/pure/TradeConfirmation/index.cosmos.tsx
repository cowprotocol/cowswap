import React from 'react'

import { inputCurrencyInfoMock, outputCurrencyInfoMock, priceImpactMock } from 'mocks/tradeStateMock'

import { TradeConfirmation } from './index'

const Fixtures = {
  default: (
    <TradeConfirmation
      title="Review order"
      inputCurrencyInfo={inputCurrencyInfoMock}
      outputCurrencyInfo={outputCurrencyInfoMock}
      onConfirm={() => void 0}
      onDismiss={() => void 0}
      isConfirmDisabled={false}
      priceImpact={priceImpactMock}
    >
      <span>Trade confirmation</span>
    </TradeConfirmation>
  ),
}

export default Fixtures
