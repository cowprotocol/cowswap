import { fireEvent, render, screen } from '@testing-library/react'

import { CancelButton } from './SidebarSections.pure'

import { LinguiWrapper } from '../../../LinguiJestProvider'

describe('CancelButton', () => {
  function renderButton(hasDrawing: boolean): jest.Mock {
    const onCancel = jest.fn()

    render(
      <LinguiWrapper>
        <CancelButton onCancel={onCancel} hasDrawing={hasDrawing} />
      </LinguiWrapper>,
    )

    return onCancel
  }

  it('cancels straight away while there is nothing to lose', () => {
    const onCancel = renderButton(false)

    fireEvent.click(screen.getByText('✕ cancel'))

    expect(onCancel).toHaveBeenCalled()
  })

  it('asks before throwing a drawing away', () => {
    const onCancel = renderButton(true)

    fireEvent.click(screen.getByText('✕ cancel'))
    expect(onCancel).not.toHaveBeenCalled()

    fireEvent.click(screen.getByText('✕ discard it'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('puts the painter back where they were', () => {
    const onCancel = renderButton(true)

    fireEvent.click(screen.getByText('✕ cancel'))
    fireEvent.click(screen.getByText('↩ keep drawing'))

    expect(onCancel).not.toHaveBeenCalled()
    expect(screen.getByText('✕ cancel')).toBeTruthy()
  })
})
