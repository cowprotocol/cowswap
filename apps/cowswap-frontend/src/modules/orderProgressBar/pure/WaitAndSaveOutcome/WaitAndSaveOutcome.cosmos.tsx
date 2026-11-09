import { ReactNode } from 'react'

import { USDC_MAINNET } from '@cowprotocol/common-const'
import { tryParseCurrencyAmount } from '@cowprotocol/common-utils'

import { DemoContainer } from 'cosmos.decorator'

import { BaseTradeConfirmation, CowParticipationFooter } from 'modules/trade'

import { WAIT_AND_SAVE_OUTCOME_DEMO } from './waitAndSaveOutcome.demo'
import { WaitAndSaveOutcome, WaitAndSaveOutcomeProps } from './WaitAndSaveOutcome.pure'

const sellAmount = tryParseCurrencyAmount('1000', USDC_MAINNET)
const receivedAmount = tryParseCurrencyAmount('2612480.12', USDC_MAINNET)

const LONG_SYMBOL_OUTCOME: WaitAndSaveOutcomeProps = {
  ...WAIT_AND_SAVE_OUTCOME_DEMO,
  gainAmount: '14.6161',
  gainFiat: '$142.37',
  gainPercent: 2.94,
  tradingAloneAmount: '497.8312',
  tradingAloneNumeric: 497.8312,
  gainNumeric: 14.6161,
  tokenSymbol: 'B-80BAL-20WETH',
}

const TINY_GAIN_OUTCOME: WaitAndSaveOutcomeProps = {
  ...WAIT_AND_SAVE_OUTCOME_DEMO,
  gainAmount: '0.004',
  gainFiat: '<$0.01',
  gainPercent: 0.004,
  tradingAloneAmount: '10,000',
  tradingAloneNumeric: 10_000,
  gainNumeric: 1,
  tokenSymbol: 'USDC',
}

function ComposedConfirmation(props: WaitAndSaveOutcomeProps): ReactNode {
  return (
    <DemoContainer>
      <BaseTradeConfirmation
        heading={{
          title: 'Swap complete',
          subtitle: 'Your USDC is in your wallet.',
        }}
        tokenPair={{
          variant: 'slim',
          inputCurrencyInfo: {
            amount: sellAmount,
            fiatAmount: null,
            balance: null,
            label: 'You sold',
          },
          outputCurrencyInfo: {
            amount: receivedAmount,
            fiatAmount: null,
            balance: null,
            label: 'You received',
          },
          priceImpact: { priceImpact: undefined, loading: false },
          footer: <CowParticipationFooter kind="cow" />,
        }}
      >
        <WaitAndSaveOutcome {...props} />
      </BaseTradeConfirmation>
    </DemoContainer>
  )
}

function OutcomeCard(props: WaitAndSaveOutcomeProps): ReactNode {
  return (
    <DemoContainer>
      <WaitAndSaveOutcome {...props} />
    </DemoContainer>
  )
}

const Fixtures = {
  default: <OutcomeCard {...WAIT_AND_SAVE_OUTCOME_DEMO} />,
  longSymbol: <OutcomeCard {...LONG_SYMBOL_OUTCOME} />,
  tinyGain: <OutcomeCard {...TINY_GAIN_OUTCOME} />,
  swapCompleteWaitAndSave: <ComposedConfirmation {...WAIT_AND_SAVE_OUTCOME_DEMO} />,
  swapCompleteLongSymbol: <ComposedConfirmation {...LONG_SYMBOL_OUTCOME} />,
}

export default Fixtures
