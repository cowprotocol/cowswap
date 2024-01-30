import { USDC_MAINNET, WBTC } from '@cowprotocol/common-const'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { UiOrderType } from 'utils/orderUtils/getUiOrderType'

import { PendingOrderNotification } from './index'

const defaultProps = {
  orderId:
    '0x62baf4be8adec4766d26a2169999cc170c3ead90ae11a28d658e6d75edc05b185b0abe214ab7875562adee331deff0fe1912fe42644d2bb7',
  kind: OrderKind.SELL,
  orderType: UiOrderType.SWAP,
  inputAmount: CurrencyAmount.fromRawAmount(USDC_MAINNET, 500_000 * 10 ** USDC_MAINNET.decimals),
  outputAmount: CurrencyAmount.fromRawAmount(WBTC, 1.2 * 10 ** WBTC.decimals),
  recipient: '0xfb3c7eb936cAA12B5A884d612393969A557d4307',
}

const Wrapper = styled.div`
  width: 560px;
  margin: 0 auto;
`

const Fixtures = {
  default: (
    <Wrapper>
      <PendingOrderNotification {...defaultProps} />
    </Wrapper>
  ),
}

export default Fixtures
