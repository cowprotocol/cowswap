import { ReactNode, useState } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { Fraction } from '@cowprotocol/currency'

import { fireEvent, render, RenderResult, screen } from '@testing-library/react'

import { PricePercentageShortcuts } from './PricePercentageShortcuts.pure'

i18n.load('en-US', {})
i18n.activate('en-US')

const MARKET_RATE = new Fraction(2010)

function getCustomInput(isInverted: boolean): HTMLInputElement {
  return screen.getByLabelText(
    isInverted ? 'Custom percentage below market' : 'Custom percentage above market',
  ) as HTMLInputElement
}

function Harness({ isInverted }: { isInverted: boolean }): ReactNode {
  const [activeRate, setActiveRate] = useState<Fraction | null>(MARKET_RATE)

  return (
    <PricePercentageShortcuts
      referenceRate={MARKET_RATE}
      activeRate={activeRate}
      isInverted={isInverted}
      disabled={false}
      onSelect={setActiveRate}
    />
  )
}

function renderShortcuts(isInverted: boolean): RenderResult {
  return render(
    <I18nProvider i18n={i18n}>
      <Harness isInverted={isInverted} />
    </I18nProvider>,
  )
}

function rerenderShortcuts(view: RenderResult, isInverted: boolean): void {
  view.rerender(
    <I18nProvider i18n={i18n}>
      <Harness isInverted={isInverted} />
    </I18nProvider>,
  )
}

describe('PricePercentageShortcuts', () => {
  it('keeps the custom percentage across inverts, converted to the inverted side', () => {
    const view = renderShortcuts(false)

    fireEvent.change(getCustomInput(false), { target: { value: '7' } })
    expect(getCustomInput(false).value).toBe('7')
    expect(getCustomInput(false).getAttribute('aria-invalid')).toBe('false')

    rerenderShortcuts(view, true)
    expect(getCustomInput(true).value).toBe('6.54')
    expect(getCustomInput(true).getAttribute('aria-invalid')).toBe('false')

    rerenderShortcuts(view, false)
    expect(getCustomInput(false).value).toBe('7')
  })

  it('clears the converted custom percentage when a preset is selected after an invert', () => {
    const view = renderShortcuts(false)

    fireEvent.change(getCustomInput(false), { target: { value: '7' } })
    rerenderShortcuts(view, true)
    fireEvent.click(screen.getByRole('button', { name: /10/ }))

    expect(getCustomInput(true).value).toBe('')
    expect(screen.getByRole('button', { name: /10/ }).getAttribute('aria-pressed')).toBe('true')
  })

  it('keeps a percentage typed on the inverted side after inverting back and forth', () => {
    const view = renderShortcuts(true)

    fireEvent.change(getCustomInput(true), { target: { value: '20' } })
    rerenderShortcuts(view, false)
    expect(getCustomInput(false).value).toBe('25')

    rerenderShortcuts(view, true)
    expect(getCustomInput(true).value).toBe('20')
  })
})
