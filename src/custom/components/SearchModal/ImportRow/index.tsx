import React, { CSSProperties } from 'react'
import { Token } from '@uniswap/sdk-core'
import styled from 'styled-components/macro'
import ImportRowMod, { TokenSection } from './ImportRowMod'
import { AutoRow } from 'components/Row'

interface ImportRowProps {
  token: Token
  style?: CSSProperties
  dim?: boolean
  showImportView: () => void
  setImportToken: (token: Token) => void
}

const Wrapper = styled.div`
  width: 100%;

  ${TokenSection} > div > div {
    flex-flow: column wrap;
    align-items: flex-start;
  }

  ${TokenSection} > svg {
    stroke: ${({ theme }) => theme.text2};
  }

  ${AutoRow} > div {
    color: ${({ theme }) => theme.text1};
    margin: 0;
  }
`

export default function ImportRow(props: ImportRowProps) {
  return (
    <Wrapper>
      <ImportRowMod {...props} />
    </Wrapper>
  )
}
