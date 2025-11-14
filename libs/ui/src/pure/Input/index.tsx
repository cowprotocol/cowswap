import { InputHTMLAttributes, ReactNode } from 'react'

import { Search } from 'react-feather'
import styled from 'styled-components/macro'

import { UI } from '../../enum'

const Wrapper = styled.div`
  display: inline-flex;
  align-items: center;
  flex-direction: row;
  width: 100%;
`

const SearchIcon = styled(Search)`
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

const SearchInputEl = styled.input`
  position: relative;
  display: flex;
  padding: 8px 16px 8px 10px;
  align-items: center;
  width: 100%;
  white-space: nowrap;
  outline: none;
  background: transparent;
  color: inherit;
  appearance: none;
  font-size: 16px;
  border-radius: 12px;
  border: none;

  &::placeholder {
    color: inherit;
    opacity: 0.7;
    transition: color 0.1s ease-in-out;
  }

  &:focus::placeholder {
    color: transparent;
  }
`

export function SearchInput(props: InputHTMLAttributes<HTMLInputElement>): ReactNode {
  return (
    <Wrapper>
      <SearchIcon size={20} />
      <SearchInputEl type="text" {...props} />
    </Wrapper>
  )
}
