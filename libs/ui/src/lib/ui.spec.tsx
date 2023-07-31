import { render } from '@testing-library/react'

import { PinkTitle } from './ui'

describe('Ui', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PinkTitle />)
    expect(baseElement).toBeTruthy()
  })
})
