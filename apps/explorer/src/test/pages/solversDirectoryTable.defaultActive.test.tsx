import React from 'react'

import { render, screen } from '@testing-library/react'

import { SolversDirectoryTable } from '../../explorer/pages/SolversDirectoryTable'
import { SolversInfo } from '../../utils/fetchSolversInfo'

const SOLVERS_INFO: SolversInfo = [
  {
    solverId: 'active-solver',
    displayName: 'Active Solver',
    description: 'Active description',
    website: 'https://active.example',
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
    solverId: 'inactive-solver',
    displayName: 'Inactive Solver',
    description: 'Inactive description',
    website: 'https://inactive.example',
    image: undefined,
    networks: [{ chainId: 1, chainName: 'Ethereum', environments: ['prod'] }],
    deployments: [
      {
        chainId: 1,
        chainName: 'Ethereum',
        environment: 'prod',
        active: false,
      },
    ],
  },
]

describe('SolversDirectoryTable default active filter', () => {
  it('shows only active solvers on initial render', () => {
    render(<SolversDirectoryTable solversInfo={SOLVERS_INFO} />)

    expect(screen.getByDisplayValue('Active')).not.toBeNull()
    expect(screen.getByText('Active Solver')).not.toBeNull()
    expect(screen.queryByText('Inactive Solver')).toBeNull()
    expect(screen.queryByText('Website')).toBeNull()
    expect(screen.queryByText('Description')).toBeNull()
  })
})
