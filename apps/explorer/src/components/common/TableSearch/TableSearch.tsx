import React from 'react'

import { Media } from '@cowprotocol/ui'

import searchImg from 'assets/img/search2.svg'
import styled from 'styled-components/macro'

import { Wrapper, Input, SearchIcon } from '../../../explorer/components/common/Search/Search.styled'

// assets

interface SearchProps {
  query: string
  setQuery: (query: string) => void
  placeholder?: string
}

const SearchWrapped = styled(Wrapper)`
  max-width: 400px;
  margin-left: 1.6rem;

  ${Media.upToSmall()} {
    margin-left: 0;
    max-width: 100%;
    display: flex;
    flex-direction: column;
  }
  ${SearchIcon} {
    width: 1.6rem;
    height: 1.6rem;
    position: absolute;
    left: 2rem;
    top: 1.2rem;
  }
  ${Input} {
    height: 4rem;
    font-size: 1.5rem;

    ${Media.upToExtraSmall()} {
      padding: 0 0.5rem 0 4rem;
    }

    &::placeholder {
      color: ${({ theme }): string => theme.greyShade};
      transition: all 0.2s ease-in-out;

      ${Media.upToSmall()} {
        font-size: 1.3rem;
        white-space: pre-line;
      }

      ${Media.upToExtraSmall()} {
        font-size: 1.2rem;
      }
    }
    &:focus::placeholder {
      color: transparent;
    }
  }
`

export function TableSearch({
  query,
  setQuery,
  placeholder = 'Search token by name, symbol or hash',
}: SearchProps): React.ReactNode {
  return (
    <SearchWrapped onSubmit={(e): void => e.preventDefault()}>
      <SearchIcon src={searchImg} />
      <Input
        autoComplete="off"
        type="search"
        name="query"
        value={query}
        onChange={(e): void => setQuery(e.target.value.trim())}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </SearchWrapped>
  )
}
