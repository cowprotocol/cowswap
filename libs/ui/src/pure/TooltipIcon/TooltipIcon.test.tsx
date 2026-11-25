import { useMediaQuery } from '@cowprotocol/common-hooks'

import { render, screen } from '@testing-library/react'

import { TooltipIcon } from './TooltipIcon.pure'

jest.mock('@cowprotocol/common-hooks', () => ({
  useMediaQuery: jest.fn(),
}))

jest.mock('react-inlinesvg', () => () => null)

const useMediaQueryMock = useMediaQuery as jest.MockedFunction<typeof useMediaQuery>

describe('TooltipIcon', () => {
  beforeEach(() => {
    useMediaQueryMock.mockImplementation((query) => query === '(pointer: fine)')
  })

  it('uses a named button trigger on desktop hover tooltips', () => {
    render(<TooltipIcon type="info" title="Wait & save" content="Details" />)

    expect(screen.getByRole('button', { name: 'Wait & save' })).toBeTruthy()
  })
})
