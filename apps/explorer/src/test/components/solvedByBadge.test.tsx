import { ReactNode } from 'react'

import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import { SolvedByBadge } from '../../components/orders/DetailsTable/SolvedByBadge'
import { OrderSolverInfo } from '../../hooks/useOrderSolver'

jest.mock('state/network', () => ({
  useNavigationPathPrefix: (): string => 'arb1',
}))

function renderBadge(solvedBy?: OrderSolverInfo): HTMLElement {
  const wrapper = ({ children }: { children: ReactNode }): ReactNode => <MemoryRouter>{children}</MemoryRouter>

  return render(<SolvedByBadge solvedBy={solvedBy} />, { wrapper }).container
}

describe('SolvedByBadge', () => {
  it.each([
    ['an EVM address', '0xdd5aecdd8ba8498706e2583f6e2ff90e08e1c01b', '0xDd5A...c01b'],
    ['a Solana address', '3jHwQjTMvBgVDQL5KcQGbE5wFZRgrS1cH8RoWbpQE9be', '3jHwQj...E9be'],
  ])('shows a generic icon instead of a character from %s', (_, solverId, displayName) => {
    const container = renderBadge({ solverId, displayName, isUnidentified: true })

    expect(container.querySelector('svg')).not.toBeNull()
    expect(container.querySelector('img')).toBeNull()
    expect(container.textContent).toBe(displayName)
    expect(container.querySelector('a')?.getAttribute('href')).toBe(`/arb1/solvers?solver=${solverId}`)
  })

  it('keeps the initial for a CMS solver with a name and no logo', () => {
    const container = renderBadge({ solverId: 'dfusion', displayName: 'dfusion' })

    expect(container.querySelector('svg')).toBeNull()
    expect(container.querySelector('img')).toBeNull()
    expect(container.textContent).toBe('Ddfusion')
  })

  it('shows the CMS logo when the solver has one', () => {
    const image = 'https://cms.example/logo.png'
    const container = renderBadge({ solverId: 'kaisersolver', displayName: 'Kaisersolver', image })

    expect(container.querySelector('img')?.getAttribute('src')).toBe(image)
    expect(container.querySelector('svg')).toBeNull()
    expect(container.textContent).toBe('Kaisersolver')
  })

  it('shows a dash without a solver', () => {
    expect(renderBadge().textContent).toBe('-')
  })
})
