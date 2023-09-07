import { Token } from '@uniswap/sdk-core'
import { TokenList } from '@uniswap/token-lists'

import { transparentize } from 'polished'
import styled from 'styled-components/macro'

import { RowBetween } from 'legacy/components/Row'
import { CurrencyModalView } from 'legacy/components/SearchModal/CurrencySearchModal'
import { SearchInput, Separator } from 'legacy/components/SearchModal/styleds'

import { UI } from 'common/constants/theme'

import ManageMod from './ManageMod'

export const Wrapper = styled.div`
  width: 100%;
  position: relative;
  padding-bottom: 80px;
  overflow-y: hidden;

  ${SearchInput} {
    border: none;
    transition: background 0.3s ease-in-out;
    background: var(${UI.COLOR_GREY});
  }

  ${SearchInput}::placeholder {
    font-size: 16px;
    color: ${({ theme }) => transparentize(0.2, theme.text1)};
  }

  ${SearchInput}:focus::placeholder {
    color: ${({ theme }) => transparentize(0.9, theme.text1)};
  }

  ${Separator} {
    background: none;
  }
`

const ToggleWrapper = styled(RowBetween)`
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
  background-color: ${({ theme, active }) => (active ? theme.bg1 : theme.bg1)};
  color: ${({ theme, active }) => (active ? `var(${UI.COLOR_TEXT1})` : theme.disabled)};
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
