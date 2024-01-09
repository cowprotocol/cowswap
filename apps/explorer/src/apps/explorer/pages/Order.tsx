import React from 'react'
import { Helmet } from 'react-helmet'

import { useOrderIdParam } from 'hooks/useSanitizeOrderIdAndUpdateUrl'
import { isAnOrderId } from 'utils'

import RedirectToSearch from 'components/RedirectToSearch'
import { OrderWidget } from 'apps/explorer/components/OrderWidget'
import { Wrapper as WrapperMod } from './styled'
import styled from 'styled-components'
import { APP_TITLE } from 'apps/explorer/const'

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
