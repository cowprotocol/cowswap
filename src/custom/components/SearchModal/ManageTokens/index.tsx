import { Token } from '@uniswap/sdk-core'
import styled, { DefaultTheme } from 'styled-components/macro'
import Card from 'components/Card'
import ImportRow from 'components/SearchModal/ImportRow'
import ManageTokensMod, { ManageTokensProps, Footer } from './ManageTokensMod'
import { CurrencyModalView } from 'components/SearchModal/CurrencySearchModal'
import { Separator } from 'components/SearchModal/styleds'
import Column from 'components/Column'
import Row, { RowFixed, RowBetween } from 'components/Row'
import { ButtonText, LinkIcon } from 'theme'

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

  ${Column} > ${Separator} + div {
    height: 100%;
    grid-auto-rows: min-content;
    ${({ theme }) => theme.neumorphism.boxShadow}
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
  return (
    <Wrapper>
      <ManageTokensMod {...props} ImportTokensRow={ImportTokensRow} />
    </Wrapper>
  )
}
