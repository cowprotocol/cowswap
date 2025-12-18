import type { ReactElement } from 'react'

import { inputCurrencyInfoMock, outputCurrencyInfoMock, priceImpactMock } from 'mocks/tradeStateMock'

import { TradeConfirmationView } from './index'

function TradeConfirmationSampleContent(restContent: ReactElement): ReactElement {
  return (
    <>
      <span>Trade confirmation</span>
      {restContent}
    </>
  )
}

const Fixtures = {
  default: () => (
    <TradeConfirmationView
      title="Review order"
      appData={null}
      isSmartContractWallet={false}
      isCurrentTradeBridging={false}
      account={undefined}
      ensName={undefined}
      inputCurrencyInfo={inputCurrencyInfoMock}
      outputCurrencyInfo={outputCurrencyInfoMock}
      onConfirm={async () => undefined}
      onDismiss={() => void 0}
      isConfirmDisabled={false}
      priceImpact={priceImpactMock}
      recipient={null}
      hasPendingTrade={false}
      signingStep={null}
      forcePriceConfirmation={false}
    >
      {TradeConfirmationSampleContent}
    </TradeConfirmationView>
  ),
}

export default Fixtures
