import { ReactElement, useEffect, useRef } from 'react'

import { Link } from 'react-router'
import styled from 'styled-components/macro'

import { headingToId } from './utils'

const LinkScrollableStyled = styled(Link)`
  color: ${({ theme }) => theme.blue1} !important;
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function Table({ children }: { children: ReactElement }) {
  return (
    <div id="table-container">
      <table>{children}</table>
    </div>
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function H2({ children }: { children: ReactElement }) {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const content = ref.current

    if (!content) return

    content.id = headingToId(content.textContent)
  }, [])

  return <h2 ref={ref}>{children}</h2>
}

export const markdownComponents = { table: Table, h2: H2, a: LinkScrollableStyled }
