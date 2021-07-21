import React from 'react'
import { Token } from '@uniswap/sdk-core'
import { DefaultTheme } from 'styled-components/macro'
import Card from 'components/Card'
import ImportRow from 'components/SearchModal/ImportRow'
import ManageTokensMod, { ManageTokensProps } from './ManageTokensMod'
import { CurrencyModalView } from 'components/SearchModal/CurrencySearchModal'

export type ImportTokensRowProps = Omit<ManageTokensProps, 'ImportTokensRow'> & {
  theme: DefaultTheme
  searchToken: Token
}

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
