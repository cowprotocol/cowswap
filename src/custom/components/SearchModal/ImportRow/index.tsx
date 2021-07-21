import React, { CSSProperties } from 'react'
import { Token } from '@uniswap/sdk-core'
import styled from 'styled-components/macro'
import ImportRowMod from './ImportRowMod'
import { AutoRow } from 'components/Row'

interface ImportRowProps {
  token: Token
  style?: CSSProperties
  dim?: boolean
  showImportView: () => void
  setImportToken: (token: Token) => void
}

const Wrapper = styled.div`
  ${AutoRow} > div {
    color: ${({ theme }) => theme.text1};
  }
`

export default function ImportRow(props: ImportRowProps) {
  return (
    <Wrapper>
      <ImportRowMod {...props} />
    </Wrapper>
  )
}
