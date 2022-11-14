import { EthFlowStepper, EthFlowStepperProps, EthFlowStepperStatus } from '.'

import { useSelect } from 'react-cosmos/fixture'

const ORDER_ID =
  '0xfc5646178d29fe6412c26aaa216dba86fedcf4ebb1e49d9e3a05c5e58d59cc6a9d98c4ff9724040269bdbe3eb2078fa2cb6a21f8636ecb32'

const TX = '0x183fa3b48c676bf9c5613e3e20b67a7250acc94af8e65dbe57787f47e5e54c75'
const ORDER_REJECTED_REASON = 'Price quote expired'

const defaultProps = {
  sendEtherTx: TX,
  nativeTokenSymbol: 'xDAI',
  tokenLabel: 'USDC',
  isOrderExpired: false,
}

interface Step {
  description: string
  props: EthFlowStepperProps
}

const STEPS: Step[] = [
  {
    description: '1. User Send Order Creation Tx',
    props: { ...defaultProps, status: EthFlowStepperStatus.ETH_SENDING },
  },
  {
    description: '2. Order Creation Tx is Executed',
    props: { ...defaultProps, status: EthFlowStepperStatus.ETH_SENT },
  },
  {
    description: '3. Order is Created',
    props: { ...defaultProps, status: EthFlowStepperStatus.ETH_SENT, order: { orderId: ORDER_ID, isExpired: false } },
  },
  {
    description: '4. Order is Filled',
    props: {
      ...defaultProps,
      status: EthFlowStepperStatus.ORDER_FILLED,
      order: { orderId: ORDER_ID, isExpired: false },
    },
  },
  {
    description: '[EXPIRED] 1. Just Expired',
    props: { ...defaultProps, status: EthFlowStepperStatus.ETH_SENT, order: { orderId: ORDER_ID, isExpired: true } },
  },
  {
    description: '[EXPIRED] 2. Refunding',
    props: {
      ...defaultProps,
      status: EthFlowStepperStatus.ETH_SENT,
      order: {
        orderId: ORDER_ID,
        isExpired: true,
      },
      refundTx: TX,
    },
  },
  {
    description: '[EXPIRED] 3. Received Refund',
    props: {
      ...defaultProps,
      status: EthFlowStepperStatus.ETH_REFUNDED,
      order: {
        orderId: ORDER_ID,
        isExpired: true,
      },
      refundTx: TX,
    },
  },
  {
    description: '[REJECTED] 1. Just Rejected',
    props: {
      ...defaultProps,
      status: EthFlowStepperStatus.ETH_SENT,
      order: {
        orderId: ORDER_ID,
        isExpired: false,
        rejectedReason: ORDER_REJECTED_REASON,
      },
    },
  },
  {
    description: '[REJECTED] 2. Refunding',
    props: {
      ...defaultProps,
      status: EthFlowStepperStatus.ETH_SENT,
      order: {
        orderId: ORDER_ID,
        isExpired: false,
        rejectedReason: ORDER_REJECTED_REASON,
      },
      refundTx: TX,
    },
  },
  {
    description: '[REJECTED] 3. Refunded',
    props: {
      ...defaultProps,
      status: EthFlowStepperStatus.ETH_REFUNDED,
      order: {
        orderId: ORDER_ID,
        isExpired: false,
        rejectedReason: ORDER_REJECTED_REASON,
      },
      refundTx: TX,
    },
  },
  {
    description: `[REJECTED] If expires when also rejected, we don't care`,
    props: {
      ...defaultProps,
      status: EthFlowStepperStatus.ETH_SENT,
      order: {
        orderId: ORDER_ID,
        isExpired: true,
        rejectedReason: ORDER_REJECTED_REASON,
      },
      refundTx: TX,
    },
  },
  {
    description: '[CANCEL] 1. Open and Canceling',
    props: {
      ...defaultProps,
      status: EthFlowStepperStatus.ETH_SENT,
      order: {
        orderId: ORDER_ID,
        isExpired: false,
      },
      cancelationTx: TX,
    },
  },
  {
    description: '[CANCEL] 2. Cancelled',
    props: {
      ...defaultProps,
      status: EthFlowStepperStatus.ORDER_CANCELLED,
      order: {
        orderId: ORDER_ID,
        isExpired: false,
      },
      cancelationTx: TX,
    },
  },
  {
    description: '[CANCEL] Cancelled',
    props: {
      ...defaultProps,
      status: EthFlowStepperStatus.ORDER_CANCELLED,
      order: {
        orderId: ORDER_ID,
        isExpired: false,
      },
      cancelationTx: TX,
    },
  },
]

const STEPS_BY_DESCRIPTION = STEPS.reduce<{ [description: string]: EthFlowStepperProps }>((acc, step) => {
  acc[step.description] = step.props
  return acc
}, {})

function Fixture() {
  const [stepDescription] = useSelect('steps', {
    options: STEPS.map((step) => step.description),
  })
  const props = STEPS_BY_DESCRIPTION[stepDescription]

  return (
    <>
      <EthFlowStepper {...props} />
      <h3>Params</h3>
      <div style={{ fontSize: '0.8em' }}>
        <pre>{JSON.stringify(props, null, 2)}</pre>
      </div>
    </>
  )
}

export default Fixture
