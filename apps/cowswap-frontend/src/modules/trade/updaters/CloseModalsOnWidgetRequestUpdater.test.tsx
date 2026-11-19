import { render } from '@testing-library/react'

import { CloseModalsOnWidgetRequestUpdater } from './CloseModalsOnWidgetRequestUpdater'

import { useCloseModalsOnWidgetRequest } from '../hooks/useCloseModalsOnWidgetRequest'

jest.mock('../hooks/useCloseModalsOnWidgetRequest', () => ({ useCloseModalsOnWidgetRequest: jest.fn() }))

describe('CloseModalsOnWidgetRequestUpdater', () => {
  it('closes the screen that replaces the trade widget on the integrator request', () => {
    const onClose = jest.fn()

    render(<CloseModalsOnWidgetRequestUpdater onClose={onClose} />)

    expect(useCloseModalsOnWidgetRequest).toHaveBeenCalledWith(onClose)
  })
})
