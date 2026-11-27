import { ReactNode } from 'react'

import { USDC_MAINNET, WETH_MAINNET } from '@cowprotocol/common-const'
import { tryParseCurrencyAmount } from '@cowprotocol/common-utils'

import { DemoContainer } from 'cosmos.decorator'

import { BaseTradeConfirmation } from 'modules/trade'

import { EoaTwapSuccessContent } from './EoaTwapSuccessContent.pure'

const sellAmount = tryParseCurrencyAmount('10000', USDC_MAINNET)
const expectedAmount = tryParseCurrencyAmount('5.2621', WETH_MAINNET)
const minAmount = tryParseCurrencyAmount('4.735895', WETH_MAINNET)

function TwapSuccessFixture(): ReactNode {
  return (
    <DemoContainer>
      <BaseTradeConfirmation
        heading={{
          title: 'Your TWAP is active',
          subtitle: 'Track its progress in Orders.',
        }}
        tokenPair={{
          variant: 'slim',
          inputCurrencyInfo: {
            amount: sellAmount,
            fiatAmount: null,
            balance: null,
            label: 'Sell amount',
          },
          outputCurrencyInfo: {
            amount: expectedAmount,
            fiatAmount: null,
            balance: null,
            label: 'Expected to receive',
            prefix: '≈',
            secondaryAmount: minAmount
              ? {
                  amount: minAmount,
                  prefix: 'Min. ',
                }
              : undefined,
          },
          priceImpact: { priceImpact: undefined, loading: false },
        }}
      >
        <EoaTwapSuccessContent explorerUrl="https://explorer.cow.fi" onViewOrders={() => undefined} />
      </BaseTradeConfirmation>
    </DemoContainer>
  )
}

const Fixtures = {
  default: <TwapSuccessFixture />,
}

export default Fixtures
