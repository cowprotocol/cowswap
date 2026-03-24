import { jotaiStore } from '@cowprotocol/core'

import { Driver, DriveStep } from 'driver.js'

import { uiGuideQuotePausedState, uiGuideState } from '../../entities/uiGuide'
import { currentTradeQuoteAtom } from '../tradeQuote'
import { clickDomElement } from '../twap/utils'

export const swapSteps: DriveStep[] = [
  {
    element: '#input-currency-input',
    popover: {
      title: 'Choose Sell token',
      description: 'Pick the token and an amount you want to sell',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#output-currency-input',
    popover: {
      title: 'Choose Buy token',
      description: 'Pick a token you want to buy',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#output-currency-input .token-amount-input',
    popover: {
      title: 'Choose buy amount (optional)',
      description: 'Fill in this field if you want to receive an exact amount of an output token',
      side: 'right',
      align: 'start',
      onNextClick: (_el, _step, { driver }) => {
        clickDomElement('#output-currency-input .open-currency-select-button')

        setTimeout(() => {
          driver.moveNext()
        }, 200)
      },
    },
  },
  {
    element: '#token-selector-chains-list',
    popover: {
      title: 'Swap Across Chains',
      description: `
      <p>Swap tokens across different networks by selecting the token and chain you want in the <strong>Buy</strong> field.
      CoW Swap will handle the best routing for you.</p>

      <strong>Tip:</strong>
      <p>Always double-check the destination network and recipient address before confirming.</p>
      `,
      side: 'right',
      align: 'start',
      onPrevClick: (_el, _step, { driver }) => {
        clickDomElement('#modal-back-button')

        setTimeout(() => {
          driver.movePrevious()
        }, 200)
      },
      onNextClick: (_el, _step, { driver }) => {
        clickDomElement('#modal-back-button')

        const index = driver.getActiveIndex()
        moveToQuotePrice(index ? index + 1 : undefined, driver)
      },
    },
  },
  {
    element: '#trade-details-accordion',
    popover: {
      title: 'Review Price',
      description: `
      Check:
      <ul>
      <li>Estimated output</li>
      <li>Slippage applied</li>
      <li>Costs and fees</li>
      </ul>
      `,
      side: 'top',
      align: 'center',
      onPrevClick: (_el, _step, { driver }) => {
        clickDomElement('#output-currency-input .open-currency-select-button')
        resumeQuotePolling()

        setTimeout(() => {
          driver.movePrevious()
        }, 200)
      },
      onNextClick(_1, _2, { driver }) {
        resumeQuotePolling()
        driver.moveNext()
      },
    },
  },
  {
    element: '#open-settings-dialog-button',
    popover: {
      title: 'Settings & Preferences: Customize Your Experience',
      description: `
      <ul>
        <li><strong>Slippage tolerance</strong> → Control how much price can change when swapping</li>
        <li><strong>Order deadline</strong> → How long the order stays active</li>
        <li><strong>Custom recipient</strong> → Send tokens to another wallet</li>
        <li><strong>Partial approval</strong> → Approve only the exact amount needed for a trade or an unlimited one.</li>
        <li><strong>Hooks</strong> → Advanced custom logic (for experienced users)</li>
      </ul>

      <strong>Tip:</strong>
      <p>Beginners can keep default settings—CoW Swap is optimized automatically.</p>
      `,
      side: 'right',
      align: 'start',
      onPrevClick(_1, _2, { driver }) {
        const index = driver.getActiveIndex()
        moveToQuotePrice(index ? index - 1 : undefined, driver)
      },
      onNextClick(_1, _2, { driver }) {
        jotaiStore.set(uiGuideState, { skipped: false, finished: true })
        driver.destroy()
      },
    },
  },
]

function resumeQuotePolling(): void {
  jotaiStore.set(uiGuideQuotePausedState, false)
}

function moveToQuotePrice(index: number | undefined, driver: Driver): void {
  let unsub: (() => void) | null = null

  function moveNext(): boolean {
    resumeQuotePolling()

    if (typeof index !== 'number') return false

    const state = jotaiStore.get(currentTradeQuoteAtom)

    // Once quote is loaded - show the guide step
    if (!state.isLoading && state.quote) {
      setTimeout(() => {
        unsub?.()
        jotaiStore.set(uiGuideQuotePausedState, true)
        driver.drive(index)
      }, 200)

      return true
    }

    return false
  }

  // Destroy before going further, because quote might not be loaded and we should hide the guide UI
  driver.destroy()

  if (!moveNext()) {
    // If quote is not loaded yet, listen the quote state
    unsub = jotaiStore.sub(currentTradeQuoteAtom, moveNext)
  }
}
