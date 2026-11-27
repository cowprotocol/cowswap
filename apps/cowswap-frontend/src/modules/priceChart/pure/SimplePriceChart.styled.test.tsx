import { render } from '@testing-library/react'

import 'jest-styled-components'

import { OverlayState } from './SimplePriceChart.styled'

it('follows the rounded corners of whichever panel hosts the overlay', () => {
  const { container } = render(<OverlayState />)

  expect(container.firstChild).toHaveStyleRule('border-radius', 'inherit')
})
