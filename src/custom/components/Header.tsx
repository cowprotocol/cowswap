import React from 'react'
import styled from 'styled-components'

const HeaderFrame = styled.div`
  padding-left: 2rem;
`

export default function Header() {
  return (
    <HeaderFrame>
      <h2>
        <span role="img" aria-label="logo">
          🦐
        </span>{' '}
        OBA Swap
      </h2>
    </HeaderFrame>
  )
}
