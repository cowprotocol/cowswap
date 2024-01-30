import { USDC_MAINNET, WBTC } from '@cowprotocol/common-const'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { SnackbarPopup } from '@cowprotocol/snackbars'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { useSelect, useValue } from 'react-cosmos/client'
import { CheckCircle } from 'react-feather'
import styled from 'styled-components/macro'

import { UiOrderType } from 'utils/orderUtils/getUiOrderType'

import { PendingOrderNotification } from './index'

const SuccessIcon = styled(CheckCircle)`
  color: ${({ theme }) => theme.green1};
`

const orderId =
  '0x62baf4be8adec4766d26a2169999cc170c3ead90ae11a28d658e6d75edc05b185b0abe214ab7875562adee331deff0fe1912fe42644d2bb7'

const Wrapper = styled.div`
  width: 560px;
  margin: 0 auto;
`

function Custom({ orderType }: { orderType: UiOrderType }) {
  const [kind] = useSelect('kind', {
    options: [OrderKind.SELL, OrderKind.BUY],
    defaultValue: OrderKind.SELL,
  })

  const [receiver] = useValue('receiver', { defaultValue: '0xfb3c7eb936cAA12B5A884d612393969A557d4307' })
  const [inputAmountRaw] = useValue('inputAmount', { defaultValue: '500000' })
  const [outputAmountRaw] = useValue('outputAmount', { defaultValue: '1.2' })

  const inputAmount = CurrencyAmount.fromRawAmount(
    USDC_MAINNET,
    parseFloat(inputAmountRaw) * 10 ** USDC_MAINNET.decimals
  )
  const outputAmount = CurrencyAmount.fromRawAmount(WBTC, parseFloat(outputAmountRaw) * 10 ** WBTC.decimals)

  return (
    <Wrapper>
      <SnackbarPopup
        id="PendingOrderNotification"
        icon={<SuccessIcon size={24} />}
        duration={100_000}
        onExpire={() => console.log('expire')}
      >
        <PendingOrderNotification
          orderId={orderId}
          kind={kind}
          receiver={receiver}
          orderType={orderType}
          inputAmount={inputAmount}
          outputAmount={outputAmount}
        />
      </SnackbarPopup>
    </Wrapper>
  )
}

const Fixtures = {
  swap: <Custom orderType={UiOrderType.SWAP} />,
  limit: <Custom orderType={UiOrderType.LIMIT} />,
  twap: <Custom orderType={UiOrderType.TWAP} />,
}

export default Fixtures
