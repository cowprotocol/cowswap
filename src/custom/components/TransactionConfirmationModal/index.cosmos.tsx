import { ConfirmationPendingContent, L2Content, OperationType } from 'components/TransactionConfirmationModal'
import { COW, GNO } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import store from 'state'
import { addPendingOrder, OrderClass, OrderStatus } from 'state/orders/actions'
import { OrderKind } from '@cowprotocol/contracts'
import { TransactionSubmittedContent } from 'components/TransactionConfirmationModal/index'
import styled from 'styled-components/macro'

const txHash = '0xe87e1d02b052daa9605abe018e8172feffd1bc38ed2284e6hhhhhh' + Date.now()

const defaultProps = {
  chainId: 5,
  onDismiss() {
    console.log('Dismiss')
  },
  hash: txHash,
  pendingText: <div>pendingText</div>,
  currencyToAdd: COW[SupportedChainId.MAINNET],
  operationType: OperationType.ORDER_SIGN,
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
  L2Content: (
    <Wrapper>
      <L2Content {...defaultProps} chainId={100} />
    </Wrapper>
  ),
  TransactionSubmittedContent: (
    <Wrapper>
      <TransactionSubmittedContent {...defaultProps} />
    </Wrapper>
  ),
  ConfirmationPendingContent: (
    <Wrapper>
      <ConfirmationPendingContent {...defaultProps} />
    </Wrapper>
  ),
}

store.dispatch(
  addPendingOrder({
    id: txHash,
    chainId: 5,
    order: {
      inputToken: COW[SupportedChainId.MAINNET],
      outputToken: GNO[SupportedChainId.MAINNET],
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
