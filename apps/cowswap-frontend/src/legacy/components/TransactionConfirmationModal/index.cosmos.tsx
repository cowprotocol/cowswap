import { COW, GNO } from '@cowprotocol/common-const'
import { OrderClass, OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'

import styled from 'styled-components/macro'

import { addPendingOrder, OrderStatus } from 'legacy/state/orders/actions'
import { ConfirmOperationType } from 'legacy/state/types'

import { LegacyConfirmationPendingContent } from './LegacyConfirmationPendingContent'

import { cowSwapStore } from '../../state'
import { SerializedToken } from '../../state/user/types'

const txHash = '0xe87e1d02b052daa9605abe018e8172feffd1bc38ed2284e6hhhhhh' + Date.now()

const defaultProps = {
  chainId: 5,
  onDismiss() {
    console.log('Dismiss')
  },
  hash: txHash,
  pendingText: <div>pendingText</div>,
  currencyToAdd: COW[SupportedChainId.MAINNET],
  operationType: ConfirmOperationType.ORDER_SIGN,
  inline: false,
}

const Wrapper = styled.div`
  background: #d5e9f0;
  border-radius: 16px;

  > div {
    box-sizing: border-box;
  }
`

const Fixtures = {
  ConfirmationPendingContent: (
    <Wrapper>
      <LegacyConfirmationPendingContent {...defaultProps} />
    </Wrapper>
  ),
}

cowSwapStore.dispatch(
  addPendingOrder({
    id: txHash,
    chainId: 5,
    order: {
      inputToken: COW[SupportedChainId.MAINNET] as SerializedToken,
      outputToken: GNO[SupportedChainId.MAINNET] as SerializedToken,
      sellToken: COW[SupportedChainId.MAINNET].address,
      buyToken: GNO[SupportedChainId.MAINNET].address,
      sellAmount: '1000',
      buyAmount: '20000000',
      validTo: Date.now() + 100_000_000,
      appData: 'ggg',
      feeAmount: '120',
      kind: OrderKind.SELL,
      partiallyFillable: false,
      id: txHash,
      owner: '0xfb3c7eb936cAA12B5A884d612393969A557d4307',
      receiver: '0xfb3c7eb936cAA12B5A884d612393969A557d4307',
      summary: 'Wrap 0.02 WETH to Ether',
      status: OrderStatus.PENDING,
      creationTime: Date.now().toString(),
      sellAmountBeforeFee: 400000,
      signature: 'xxxxx',
      class: OrderClass.MARKET,
    },
  })
)

export default Fixtures
