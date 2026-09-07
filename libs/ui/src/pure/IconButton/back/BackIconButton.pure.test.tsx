import { i18n } from '@lingui/core'

import { fireEvent, render, screen } from '@testing-library/react'

import { BackIconButton } from './BackIconButton.pure'

i18n.load('en-US', {})
i18n.activate('en-US')

describe('BackIconButton', () => {
  it('can defer Escape handling to its overlay primitive', () => {
    const onClick = jest.fn()

    render(<BackIconButton backOnEscape={false} aria-label="Back to orders" onClick={onClick} />)
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClick).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Back to orders' })).not.toBeNull()
  })
})
