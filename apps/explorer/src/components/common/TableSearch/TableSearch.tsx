import React from 'react'

import searchImg from 'assets/img/search2.svg'

import { SearchWrapped } from './styled'

import { Input, SearchIcon } from '../../../explorer/components/common/Search/Search.styled'

interface SearchProps {
  query: string
  setQuery: (query: string) => void
  placeholder?: string
}

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
