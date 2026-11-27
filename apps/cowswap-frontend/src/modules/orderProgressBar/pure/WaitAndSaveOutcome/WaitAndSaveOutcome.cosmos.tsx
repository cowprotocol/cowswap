import { ReactNode } from 'react'

import { USDC_MAINNET } from '@cowprotocol/common-const'
import { tryParseCurrencyAmount } from '@cowprotocol/common-utils'

import { DemoContainer } from 'cosmos.decorator'

import { BaseTradeConfirmation, CowParticipationFooter } from 'modules/trade'

import {
  WAIT_AND_SAVE_WITH_COW_DEMO,
  WAIT_AND_SAVE_WITH_COW_LONG_SYMBOL_DEMO,
  WAIT_AND_SAVE_WITH_WAIVED_FEE_AND_COW_FIAT_DEMO,
  WAIT_AND_SAVE_WITH_WAIVED_FEE_AND_COW_LONG_SYMBOL_DEMO,
  WAIT_AND_SAVE_WITH_WAIVED_FEE_AND_COW_TOKEN_DEMO,
  WAIT_AND_SAVE_WITH_WAIVED_FEE_DEMO,
  WAIT_AND_SAVE_WITH_WAIVED_FEE_LONG_SYMBOL_DEMO,
} from './waitAndSaveOutcome.demo'
import { WaitAndSaveOutcome, WaitAndSaveOutcomeProps } from './WaitAndSaveOutcome.pure'

const sellAmount = tryParseCurrencyAmount('1000', USDC_MAINNET)
const receivedAmount = tryParseCurrencyAmount('2612480.12', USDC_MAINNET)

function ComposedConfirmation({
  outcome,
  showCowFooter,
}: {
  outcome: WaitAndSaveOutcomeProps
  showCowFooter?: boolean
}): ReactNode {
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
          footer: showCowFooter ? <CowParticipationFooter kind="cow" /> : undefined,
        }}
      >
        <WaitAndSaveOutcome {...outcome} />
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
  withWaivedFeeAndCowFiat: <OutcomeCard {...WAIT_AND_SAVE_WITH_WAIVED_FEE_AND_COW_FIAT_DEMO} />,
  withWaivedFeeAndCowToken: <OutcomeCard {...WAIT_AND_SAVE_WITH_WAIVED_FEE_AND_COW_TOKEN_DEMO} />,
  withWaivedFeeAndCowLongSymbol: <OutcomeCard {...WAIT_AND_SAVE_WITH_WAIVED_FEE_AND_COW_LONG_SYMBOL_DEMO} />,
  withWaivedFee: <OutcomeCard {...WAIT_AND_SAVE_WITH_WAIVED_FEE_DEMO} />,
  withWaivedFeeLongSymbol: <OutcomeCard {...WAIT_AND_SAVE_WITH_WAIVED_FEE_LONG_SYMBOL_DEMO} />,
  withCow: <OutcomeCard {...WAIT_AND_SAVE_WITH_COW_DEMO} />,
  withCowLongSymbol: <OutcomeCard {...WAIT_AND_SAVE_WITH_COW_LONG_SYMBOL_DEMO} />,

  swapCompleteWithWaivedFeeAndCowFiat: (
    <ComposedConfirmation outcome={WAIT_AND_SAVE_WITH_WAIVED_FEE_AND_COW_FIAT_DEMO} showCowFooter />
  ),
  swapCompleteWithWaivedFeeAndCowToken: (
    <ComposedConfirmation outcome={WAIT_AND_SAVE_WITH_WAIVED_FEE_AND_COW_TOKEN_DEMO} showCowFooter />
  ),
  swapCompleteWithWaivedFeeAndCowLongSymbol: (
    <ComposedConfirmation outcome={WAIT_AND_SAVE_WITH_WAIVED_FEE_AND_COW_LONG_SYMBOL_DEMO} showCowFooter />
  ),
  swapCompleteWithWaivedFee: <ComposedConfirmation outcome={WAIT_AND_SAVE_WITH_WAIVED_FEE_DEMO} />,
  swapCompleteWithWaivedFeeLongSymbol: (
    <ComposedConfirmation outcome={WAIT_AND_SAVE_WITH_WAIVED_FEE_LONG_SYMBOL_DEMO} />
  ),
  swapCompleteWithCow: <ComposedConfirmation outcome={WAIT_AND_SAVE_WITH_COW_DEMO} showCowFooter />,
  swapCompleteWithCowLongSymbol: (
    <ComposedConfirmation outcome={WAIT_AND_SAVE_WITH_COW_LONG_SYMBOL_DEMO} showCowFooter />
  ),
}

export default Fixtures
