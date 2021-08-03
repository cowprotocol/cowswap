import React from 'react'
import { Token } from '@uniswap/sdk-core'
import styled, { DefaultTheme } from 'styled-components/macro'
import Card from 'components/Card'
import ImportRow from 'components/SearchModal/ImportRow'
import ManageTokensMod, { ManageTokensProps } from './ManageTokensMod'
import { CurrencyModalView } from 'components/SearchModal/CurrencySearchModal'
import Row, { RowFixed, RowBetween } from 'components/Row'
import { ButtonText, LinkIcon } from 'theme'

export type ImportTokensRowProps = Omit<ManageTokensProps, 'ImportTokensRow'> & {
  theme: DefaultTheme
  searchToken: Token
}

export const Wrapper = styled.div`
  width: 100%;
  height: calc(100% - 60px);
  position: relative;
  padding-bottom: 80px;

  ${Row} > div {
    margin: 0;
  }

  ${RowBetween} > div {
    color: ${({ theme }) => theme.text1};
  }

  // Custom Tokens Title
  ${RowBetween}:first-child > div {
    opacity: 0.7;
  }

  // Token name
  ${RowBetween} > div > a > div {
    color: ${({ theme }) => theme.text1};
  }

  ${RowFixed} > svg,
  ${RowFixed} > a {
    transition: stroke 0.2s ease-in-out;
  }

  ${RowFixed} > svg:hover,
  ${RowFixed} > a,
  ${RowFixed} > a:hover > svg {
    stroke: ${({ theme }) => theme.text1};
  }

  ${LinkIcon} {
    stroke: ${({ theme }) => theme.text3};
  }

  ${ButtonText} > div {
    color: ${({ theme }) => theme.primary1};
  }
`

const ImportTokensRow = ({ theme, searchToken, setModalView, setImportToken }: ImportTokensRowProps) => (
  <Card backgroundColor={theme.bg4} padding="10px 0">
    <ImportRow
      token={searchToken}
      showImportView={() => setModalView(CurrencyModalView.importToken)}
      setImportToken={setImportToken}
      style={{ height: 'fit-content' }}
    />
  </Card>
)

export default function ManageTokens(props: Omit<ManageTokensProps, 'ImportTokensRow'>) {
  return <ManageTokensMod {...props} ImportTokensRow={ImportTokensRow} />
}
