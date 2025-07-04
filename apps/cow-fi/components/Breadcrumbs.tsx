import React from 'react'

import { UI } from '@cowprotocol/ui'

import Link from 'next/link'
import styled from 'styled-components/macro'

export const StyledBreadcrumbs = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.4rem;
  margin: 0 0 1.6rem;
  font-weight: 400;
  color: var(${UI.COLOR_NEUTRAL_10});

  > a {
    color: var(${UI.COLOR_NEUTRAL_10});
    transition: color 0.2s ease-in-out;
    text-decoration: none;
    line-height: 1.2;
    border-bottom: 0.1rem solid transparent;
  }

  > a:hover {
    color: var(${UI.COLOR_NEUTRAL_10});
    border-bottom: 0.1rem solid var(${UI.COLOR_NEUTRAL_10});
  }

  .breadcrumbs-arrow {
    --size: 2.1rem;
    width: var(--size);
    height: var(--size);
    margin: 0 0.3rem;
  }

  > b {
    font-weight: normal;
    opacity: 0.7;
    line-height: 1.2;
  }
`

interface Crumb {
  text: string
  href?: string
}

export const Breadcrumbs = ({ crumbs }: { crumbs: Crumb[] }) => (
  <StyledBreadcrumbs>
    {crumbs.map((crumb, i) => (
      <React.Fragment key={i}>
        {i < crumbs.length - 1 ? (
          <>
            <Link href={crumb.href || ''}>{crumb.text}</Link>
            <img className="breadcrumbs-arrow" src="/images/arrow-next-right.svg" alt="Breadcrumbs arrow" />
          </>
        ) : (
          <b>{crumb.text}</b>
        )}
      </React.Fragment>
    ))}
  </StyledBreadcrumbs>
)
