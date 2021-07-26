import React from 'react'
import ManageMod from './ManageMod'
import styled from 'styled-components/macro'
import { Token } from '@uniswap/sdk-core'
import { RowBetween } from 'components/Row'
import { TokenList } from '@uniswap/token-lists'
import { CurrencyModalView } from '@src/components/SearchModal/CurrencySearchModal'

const ToggleWrapper = styled(RowBetween)`
  background-color: ${({ theme }) => theme.bg4};
  border-radius: 12px;
  padding: 6px;
`

const ToggleOption = styled.div<{ active?: boolean }>`
  width: 48%;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-weight: 600;
  background-color: ${({ theme, active }) => (active ? theme.bg1 : theme.bg4)};
  color: ${({ theme, active }) => (active ? theme.text1 : theme.disabled)};
  user-select: none;

  :hover {
    cursor: pointer;
    opacity: 0.9;
  }
`

export interface ManageProps {
  onDismiss: () => void
  setModalView: (view: CurrencyModalView) => void
  setImportToken: (token: Token) => void
  setImportList: (list: TokenList) => void
  setListUrl: (url: string) => void
  ToggleOption: typeof ToggleOption
  ToggleWrapper: typeof ToggleWrapper
}

export default function Manage(props: Omit<ManageProps, 'ToggleOption' | 'ToggleWrapper'>) {
  return <ManageMod {...props} ToggleOption={ToggleOption} ToggleWrapper={ToggleWrapper} />
}
