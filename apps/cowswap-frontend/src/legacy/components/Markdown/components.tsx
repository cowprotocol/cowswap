import { useEffect, useRef } from 'react'

import styled from 'styled-components/macro'

import { headingToId } from './utils'

import { LinkScrollable } from '../Link'

const LinkScrollableStyled = styled(LinkScrollable)`
  color: ${({ theme }) => theme.blue1} !important;
`

function Table({ children }: { children: JSX.Element }) {
  return (
    <div id="table-container">
      <table>{children}</table>
    </div>
  )
}

function H2({ children }: { children: JSX.Element }) {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const content = ref.current

    if (!content) return

    content.id = headingToId(content.textContent)
  }, [])

  return <h2 ref={ref}>{children}</h2>
}

export const markdownComponents = { table: Table, h2: H2, a: LinkScrollableStyled }
