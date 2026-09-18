import { Helmet } from 'react-helmet'
import styled from 'styled-components/macro'

import { Wrapper as WrapperMod, StyledSearch } from './styled'

import RedirectToSearch from '../../components/RedirectToSearch'
import { useOrderIdParam } from '../../hooks/useSanitizeOrderIdAndUpdateUrl'
import { useNetworkId } from '../../state/network'
import { isAnOrderId } from '../../utils'
import { OrderWidget } from '../components/OrderWidget'
import { APP_TITLE } from '../const'

const Wrapper = styled(WrapperMod)`
  > h1 {
    padding: 2.4rem 0 0.75rem;
  }
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const Order = () => {
  const orderId = useOrderIdParam()
  const networkId = useNetworkId()

  if (!isAnOrderId(orderId, networkId)) {
    return <RedirectToSearch from="orders" />
  }

  return (
    <Wrapper>
      <Helmet>
        <title>Order Details - {APP_TITLE}</title>
      </Helmet>
      <StyledSearch />
      <OrderWidget />
    </Wrapper>
  )
}

export default Order
