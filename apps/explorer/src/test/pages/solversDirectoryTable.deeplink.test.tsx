import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'

import { SolversDirectoryTable } from '../../explorer/pages/SolversDirectoryTable'
import { SolversInfo } from '../../utils/fetchSolversInfo'

const SOLVERS_INFO: SolversInfo = [
  {
    solverId: 'alpha',
    displayName: 'Alpha Solver',
    description: 'Alpha description',
    website: 'https://alpha.example',
    image: undefined,
    networks: [{ chainId: 1, chainName: 'Ethereum', environments: ['prod'] }],
    deployments: [
      {
        chainId: 1,
        chainName: 'Ethereum',
        environment: 'prod',
        active: true,
      },
    ],
  },
  {
    solverId: 'beta',
    displayName: 'Beta Solver',
    description: 'Beta description',
    website: 'https://beta.example',
    image: undefined,
    networks: [{ chainId: 1, chainName: 'Ethereum', environments: ['prod'] }],
    deployments: [
      {
        chainId: 1,
        chainName: 'Ethereum',
        environment: 'prod',
        active: true,
      },
    ],
  },
]

describe('SolversDirectoryTable deeplink', () => {
  const scrollIntoViewMock = jest.fn()

  beforeEach(() => {
    scrollIntoViewMock.mockReset()
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      value: scrollIntoViewMock,
      configurable: true,
    })
  })

  it('expands and scrolls to the deeplinked solver row', async () => {
    render(<SolversDirectoryTable solversInfo={SOLVERS_INFO} solverDeeplink="beta" />)

    const toggleButton = screen.getByRole('button', {
      name: 'Toggle deployments for solver Beta Solver (beta)',
    })

    await waitFor(() => {
      expect(toggleButton.getAttribute('aria-expanded')).toBe('true')
    })

    expect(scrollIntoViewMock).toHaveBeenCalled()
    expect(screen.getByText('Solver and payout addresses by chain/environment')).not.toBeNull()
  })

  it('matches deeplink by normalized identifier', async () => {
    render(<SolversDirectoryTable solversInfo={SOLVERS_INFO} solverDeeplink="beta-solve" />)

    const toggleButton = screen.getByRole('button', {
      name: 'Toggle deployments for solver Beta Solver (beta)',
    })

    await waitFor(() => {
      expect(toggleButton.getAttribute('aria-expanded')).toBe('true')
    })
  })
})
