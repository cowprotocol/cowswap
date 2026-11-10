import { ReactNode, useState } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { PricePercentageShortcuts } from './PricePercentageShortcuts.pure'

i18n.load('en-US', {})
i18n.activate('en-US')

function ControlledHarness({ isInverted, focus }: { isInverted: boolean; focus?: boolean }): ReactNode {
  const [selectedPreset, setSelectedPreset] = useState<string | undefined>('5')
  const [customValue, setCustomValue] = useState('')

  return (
    <PricePercentageShortcuts
      isInverted={isInverted}
      disabled={false}
      selectedPreset={selectedPreset}
      onSelect={(percentage) => {
        setSelectedPreset(percentage ?? undefined)
        setCustomValue(percentage ? '' : customValue || '')
      }}
      customInput={{
        value: customValue,
        selected: !selectedPreset && !!customValue,
        invalid: false,
        focus,
        onChange: (value) => {
          setSelectedPreset(undefined)
          setCustomValue(value)
        },
      }}
    />
  )
}

function getCustomInput(isInverted: boolean): HTMLInputElement {
  return screen.getByLabelText(
    isInverted ? 'Custom percentage below market' : 'Custom percentage above market',
  ) as HTMLInputElement
}

function renderShortcuts(isInverted: boolean, focus?: boolean): void {
  render(
    <I18nProvider i18n={i18n}>
      <ControlledHarness isInverted={isInverted} focus={focus} />
    </I18nProvider>,
  )
}

describe('PricePercentageShortcuts', () => {
  it('selects a preset percentage', () => {
    renderShortcuts(false)

    const preset = screen.getByRole('button', { name: /10/ })
    fireEvent.click(preset)

    expect(preset.getAttribute('aria-pressed')).toBe('true')
  })

  it('updates the custom percentage through the controlled input', () => {
    renderShortcuts(false)

    fireEvent.change(getCustomInput(false), { target: { value: '7' } })
    expect(getCustomInput(false).value).toBe('7')
  })

  it('rejects invalid custom percentage characters', () => {
    renderShortcuts(true)

    fireEvent.change(getCustomInput(true), { target: { value: '1.234' } })
    expect(getCustomInput(true).value).toBe('')
  })

  it('autofocuses the custom percentage input when focus is requested', async () => {
    renderShortcuts(false, true)

    await waitFor(() => {
      expect(document.activeElement).toBe(getCustomInput(false))
    })
  })
})
