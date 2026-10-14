import { ReactNode } from 'react'

import { useParams } from 'react-router'

import { SearchNotFound } from './SearchNotFound'

import { useSearchRedirect } from '../../hooks/useSearchRedirect'

function SearchNotFoundContainer(): ReactNode {
  const { searchString = '' } = useParams<{ searchString: string }>()
  const { path, isLoading } = useSearchRedirect(searchString)

  return <SearchNotFound redirectTo={path} isLoading={isLoading} />
}

export default SearchNotFoundContainer
