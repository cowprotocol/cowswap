import { render } from '@testing-library/react'

import { SolverLogo } from './SolverLogo.pure'

describe('SolverLogo', () => {
  it.each([
    ['a display name', { displayName: 'dfusion' }],
    ['no display name', {}],
  ])('shows the CMS image for a solver with %s', (_, solver) => {
    const image = 'https://cms.example/logo.png'
    const { container } = render(<SolverLogo solver={{ ...solver, image }} size={24} />)

    expect(container.querySelector('img')?.getAttribute('src')).toBe(image)
    expect(container.querySelector('svg')).toBeNull()
    expect(container.textContent).toBe('')
  })

  it.each([
    ['the display name', 'dfusion', 'D'],
    ['a display name with leading spaces', '  dfusion', 'D'],
    ['a leading emoji, kept whole', '🐮 Solver', '🐮'],
  ])('shows the initial from %s when there is no image', (_, displayName, initial) => {
    const { container } = render(<SolverLogo solver={{ displayName }} size={24} />)

    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('svg')).toBeNull()
    expect(container.textContent).toBe(initial)
  })

  it.each([
    ['no display name', {}],
    ['a blank display name', { displayName: '   ' }],
  ])('shows the generic icon for a solver with %s', (_, solver) => {
    const { container } = render(<SolverLogo solver={solver} size={24} />)

    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('svg')).not.toBeNull()
    expect(container.textContent).toBe('')
  })
})
