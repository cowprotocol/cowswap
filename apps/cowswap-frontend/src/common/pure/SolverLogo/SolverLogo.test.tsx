import { render } from '@testing-library/react'

import { SolverLogo } from './SolverLogo.pure'

describe('SolverLogo', () => {
  it('shows the CMS image when the solver has one', () => {
    const image = 'https://cms.example/logo.png'
    const { container } = render(<SolverLogo solver={{ solver: 'dfusion', image }} size={24} />)

    expect(container.querySelector('img')?.getAttribute('src')).toBe(image)
    expect(container.textContent).toBe('')
  })

  it.each([
    ['the display name', { solver: 'solver-id', displayName: 'dfusion' }, 'D'],
    ['the solver id without a display name', { solver: 'nexroute' }, 'N'],
    ['the solver id with a blank display name', { solver: 'nexroute', displayName: '   ' }, 'N'],
    ['a leading emoji, kept whole', { solver: 'nexroute', displayName: '🐮 Solver' }, '🐮'],
  ])('shows the initial from %s when there is no image', (_, solver, initial) => {
    const { container } = render(<SolverLogo solver={solver} size={24} />)

    expect(container.querySelector('img')).toBeNull()
    expect(container.textContent).toBe(initial)
  })
})
