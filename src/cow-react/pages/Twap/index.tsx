import * as styledEl from '../LimitOrders/styled'
import { TwapWidget } from '@cow/modules/twapOrders/contrainers/TwapWidget'
import { OrdersBox, Header, Content } from '@cow/modules/limitOrders/pure/Orders'
import { OrdersTabs } from '@cow/modules/limitOrders/pure/Orders/OrdersTabs'
// import { OrdersTabs, OrdersTabsProps } from './OrdersTabs'
import { LIMIT_ORDERS_TABS } from '@cow/modules/limitOrders/const/limitOrdersTabs'
import { TwapOrders } from '@cow/modules/twapOrders/contrainers/TwapWidget/TwapOrders'

export default function Twap() {
  return (
    <div>
      <styledEl.PageWrapper isUnlocked={true}>
        <styledEl.PrimaryWrapper>
          <TwapWidget />
        </styledEl.PrimaryWrapper>

        <styledEl.SecondaryWrapper>
          {/*<ChartWidget />*/}
          {/* <OrdersWidget /> */}

          <OrdersBox>
            <Header>
              <h2>Your Orders</h2>
              <OrdersTabs tabs={LIMIT_ORDERS_TABS} />
            </Header>
            <Content>
              <TwapOrders />
            </Content>
          </OrdersBox>
        </styledEl.SecondaryWrapper>
      </styledEl.PageWrapper>
    </div>
  )
}
