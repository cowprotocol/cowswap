import { Helmet } from 'react-helmet'

import { Wrapper } from './styled'

import { OrderAddressNotFound } from '../../components/orders/OrderNotFound'
import { APP_TITLE } from '../const'

const SearchNotFound = () => {
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
