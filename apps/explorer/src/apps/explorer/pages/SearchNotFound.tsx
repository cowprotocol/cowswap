import React from 'react'
import { Helmet } from 'react-helmet'

import { OrderAddressNotFound } from 'components/orders/OrderNotFound'
import { Wrapper } from './styled'
import { APP_TITLE } from 'apps/explorer/const'

const SearchNotFound: React.FC = () => {
  return (
    <Wrapper>
      <Helmet>
        <title>Search not found - {APP_TITLE}</title>
      </Helmet>
      <OrderAddressNotFound />
    </Wrapper>
  )
}

export default SearchNotFound
