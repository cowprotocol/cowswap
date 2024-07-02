import React from 'react'

import { Helmet } from 'react-helmet'
import styled from 'styled-components/macro'

import { Wrapper as WrapperMod } from './styled'

import RedirectToSearch from '../../components/RedirectToSearch'
import { useOrderIdParam } from '../../hooks/useSanitizeOrderIdAndUpdateUrl'
import { isAnOrderId } from '../../utils'
import { OrderWidget } from '../components/OrderWidget'
import { APP_TITLE } from '../const'

const Wrapper = styled(WrapperMod)`
  max-width: 140rem;

  > h1 {
    padding: 2.4rem 0 0.75rem;
  }
`

const Order: React.FC = () => {
  const orderId = useOrderIdParam()

  if (!isAnOrderId(orderId)) {
    return <RedirectToSearch from="orders" />
  }

  return (
    <Wrapper>
      <Helmet>
        <title>Order Details - {APP_TITLE}</title>
      </Helmet>
      <OrderWidget />
    </Wrapper>
  )
}

export default Order
