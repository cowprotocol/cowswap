import { ReactNode } from 'react'

import { Helmet } from 'react-helmet'
import { Navigate } from 'react-router'

import { Wrapper } from './styled'

import { LoadingWrapper } from '../../components/common/LoadingWrapper'
import { OrderAddressNotFound } from '../../components/orders/OrderNotFound'
import { APP_TITLE } from '../const'

interface SearchNotFoundProps {
  /** Order page to go to when the searched id turns out to live on another chain. */
  redirectTo: string | null
  isLoading: boolean
}

export function SearchNotFound({ redirectTo, isLoading }: SearchNotFoundProps): ReactNode {
  if (redirectTo) {
    return <Navigate to={redirectTo} replace />
  }

  return (
    <Wrapper>
      <Helmet>
        <title>Search not found - {APP_TITLE}</title>
      </Helmet>
      {isLoading ? <LoadingWrapper message="Searching other networks" /> : <OrderAddressNotFound />}
    </Wrapper>
  )
}
