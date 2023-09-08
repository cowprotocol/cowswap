import { Token } from '@uniswap/sdk-core'

import styled, { DefaultTheme } from 'styled-components/macro'

import Card from 'legacy/components/Card'
import Column from 'legacy/components/Column'
import Row, { RowFixed, RowBetween } from 'legacy/components/Row'
import { CurrencyModalView } from 'legacy/components/SearchModal/CurrencySearchModal'
import ImportRow from 'legacy/components/SearchModal/ImportRow'
import { Separator } from 'legacy/components/SearchModal/styleds'
import { ButtonText, LinkIcon } from 'legacy/theme'

import { UI } from 'common/constants/theme'

import ManageTokensMod, { ManageTokensProps, Footer } from './ManageTokensMod'

export type ImportTokensRowProps = Omit<ManageTokensProps, 'ImportTokensRow'> & {
  theme: DefaultTheme
  searchToken: Token
}

export const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;

  > div {
    padding: 0 0 40px;
  }

  ${Row} > div {
    margin: 0;
  }

  ${RowBetween} > div {
    color: var(${UI.COLOR_TEXT1});
  }

  // Custom Tokens Title
  ${RowBetween}:first-child > div {
    opacity: 0.7;
  }

  // Token name
  ${RowBetween} > div > a > div {
    color: var(${UI.COLOR_TEXT1});
  }

  ${RowFixed} > svg,
  ${RowFixed} > a {
    transition: stroke 0.2s ease-in-out;
  }

  ${RowFixed} > svg:hover,
  ${RowFixed} > a,
  ${RowFixed} > a:hover > svg {
    stroke: ${({ theme }) => theme.text3};
  }

  ${LinkIcon} {
    stroke: ${({ theme }) => theme.text3};
  }

  // 'Clear all' button
  ${ButtonText} > div {
    color: ${({ theme }) => theme.text3};
  }

  ${Column} > ${Separator} + div {
    height: 100%;
    grid-auto-rows: min-content;
    border-top: 1px solid ${({ theme }) => theme.grey1};
  }

  ${Footer} {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 13px;
    padding: 0;
    height: 50px;
  }
`

const ImportTokensRow = ({ theme, searchToken, setModalView, setImportToken }: ImportTokensRowProps) => (
  <Card backgroundColor={theme.bg1} padding="10px 0">
    <ImportRow
      token={searchToken}
      showImportView={() => setModalView(CurrencyModalView.importToken)}
      setImportToken={setImportToken}
      style={{ height: 'fit-content' }}
    />
  </Card>
)

export default function ManageTokens(props: Omit<ManageTokensProps, 'ImportTokensRow'>) {
  return (
    <Wrapper>
      <ManageTokensMod {...props} ImportTokensRow={ImportTokensRow} />
    </Wrapper>
  )
}
