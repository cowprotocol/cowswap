import React from 'react'

import { render, screen } from '@testing-library/react'

import { RouteNode } from '../../../explorer/components/TransanctionBatchGraph/CompactLayout.centerNodes'
import { ExecutionBreakdown } from '../../../explorer/components/TransanctionBatchGraph/types'

const executionBreakdownWithVenuesOnly: ExecutionBreakdown = {
  venues: [
    { address: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', label: 'Uniswap V3' },
    { address: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', label: 'Curve' },
  ],
  hops: [],
}

describe('RouteNode execution mix rendering', () => {
  it('shows external endpoint touches fallback when venues exist but hops are empty', () => {
    render(
      <svg>
        <RouteNode
          centerHeight={120}
          centerX={40}
          centerY={20}
          connectedRouteIds={['route-1']}
          dexLabel="CoW Protocol"
          executionBreakdown={executionBreakdownWithVenuesOnly}
          nodeWidth={300}
          onRouteEnter={jest.fn()}
          onRouteLeave={jest.fn()}
          routeStroke="#2d3358"
        />
      </svg>,
    )

    expect(screen.getByText('└─ External endpoint touches: 2')).toBeTruthy()
    expect(screen.queryByText('└─ Settlement-only flow')).toBeNull()
  })
})
