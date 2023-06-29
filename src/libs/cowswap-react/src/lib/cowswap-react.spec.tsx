import { render } from '@testing-library/react'

import SrcLibsCowswapReact from './cowswap-react'

describe('SrcLibsCowswapReact', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SrcLibsCowswapReact />)
    expect(baseElement).toBeTruthy()
  })
})
