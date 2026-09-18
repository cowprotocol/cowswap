import { ReactNode } from 'react'

import { useParams } from 'react-router'

import { SearchNotFound } from './SearchNotFound'

import { useOrderSearchRedirect } from '../../hooks/useOrderSearchRedirect'

function SearchNotFoundContainer(): ReactNode {
  const { searchString = '' } = useParams<{ searchString: string }>()
  const { path, isLoading } = useOrderSearchRedirect(searchString)

  return <SearchNotFound redirectTo={path} isLoading={isLoading} />
}

export default SearchNotFoundContainer
