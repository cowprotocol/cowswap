import { useSelect } from 'react-cosmos/client'
import styled from 'styled-components/macro'

import { EthFlowStepper, EthFlowStepperProps, SmartOrderStatus } from './index'

const ORDER_ID =
  '0xfc5646178d29fe6412c26aaa216dba86fedcf4ebb1e49d9e3a05c5e58d59cc6a9d98c4ff9724040269bdbe3eb2078fa2cb6a21f8636ecb32'

const TX = '0x183fa3b48c676bf9c5613e3e20b67a7250acc94af8e65dbe57787f47e5e54c75'
const ORDER_REJECTED_REASON = 'Price quote expired'

const defaultOrderProps = {
  orderId: ORDER_ID,
  state: SmartOrderStatus.CREATING,
  isExpired: false,
  isCreated: false,
}
const defaultProps: EthFlowStepperProps = {
  nativeTokenSymbol: 'xDAI',
  tokenLabel: 'USDC',
  order: defaultOrderProps,
  creation: { hash: TX },
  refund: {},
  cancellation: {},
}

interface Step {
  description: string
  props: EthFlowStepperProps
}

const STEPS: Step[] = [
  {
    description: '1. User Send Order Creation Tx',
    props: defaultProps,
  },
  {
    description: '2. Order Creation Tx is Executed',
    props: {
      ...defaultProps,
      order: {
        ...defaultOrderProps,
        state: SmartOrderStatus.CREATION_MINED,
      },
      creation: { ...defaultProps.creation, failed: false },
    },
  },
  {
    description: '3. Order is Created',
    props: {
      ...defaultProps,
      order: {
        ...defaultOrderProps,
        state: SmartOrderStatus.INDEXED,
      },
      creation: { ...defaultProps.creation, failed: false },
    },
  },
  {
    description: '4. Order is Filled',
    props: {
      ...defaultProps,
      order: {
        ...defaultOrderProps,
        state: SmartOrderStatus.FILLED,
      },
      creation: { ...defaultProps.creation, failed: false },
    },
  },
  {
    description: '[EXPIRED] 1. Just Expired',
    props: {
      ...defaultProps,
      order: {
        ...defaultOrderProps,
        state: SmartOrderStatus.INDEXED,
        isExpired: true,
      },
      creation: { ...defaultProps.creation, failed: false },
    },
  },
  {
    description: '[EXPIRED] 2. Refunding',
    props: {
      ...defaultProps,
      order: {
        ...defaultOrderProps,
        state: SmartOrderStatus.INDEXED,
        isExpired: true,
      },
      creation: { ...defaultProps.creation, failed: false },
      refund: { hash: TX },
    },
  },
  {
    description: '[EXPIRED] 3. Received Refund',
    props: {
      ...defaultProps,
      order: {
        ...defaultOrderProps,
        state: SmartOrderStatus.INDEXED,
        isExpired: true,
      },
      creation: { ...defaultProps.creation, failed: false },
      refund: { hash: TX, failed: false },
    },
  },
  {
    description: '[REJECTED] 1. Just Rejected',
    props: {
      ...defaultProps,
      order: {
        ...defaultOrderProps,
        state: SmartOrderStatus.INDEXED,
        rejectedReason: ORDER_REJECTED_REASON,
      },
      creation: { ...defaultProps.creation, failed: false },
    },
  },
  {
    description: '[REJECTED] 2. Refunding',
    props: {
      ...defaultProps,
      order: {
        ...defaultOrderProps,
        state: SmartOrderStatus.INDEXED,
        rejectedReason: ORDER_REJECTED_REASON,
      },
      creation: { ...defaultProps.creation, failed: false },
      refund: { hash: TX },
    },
  },
  {
    description: '[REJECTED] 3. Refunded',
    props: {
      ...defaultProps,
      order: {
        ...defaultOrderProps,
        state: SmartOrderStatus.INDEXED,
        rejectedReason: ORDER_REJECTED_REASON,
      },
      creation: { ...defaultProps.creation, failed: false },
      refund: { hash: TX, failed: false },
    },
  },

  {
    description: '[CANCEL] 1. Open and Canceling',
    props: {
      ...defaultProps,
      order: {
        ...defaultOrderProps,
        state: SmartOrderStatus.INDEXED,
      },
      creation: { ...defaultProps.creation, failed: false },
      cancellation: { hash: TX },
    },
  },
  {
    description: '[CANCEL] 2. Cancelled',
    props: {
      ...defaultProps,
      order: {
        ...defaultOrderProps,
        state: SmartOrderStatus.INDEXED,
      },
      creation: { ...defaultProps.creation, failed: false },
      cancellation: { hash: TX, failed: false },
    },
  },
  {
    description: `[REJECTED+EXPIRED] 1. Just Rejected`,
    props: {
      ...defaultProps,
      order: {
        ...defaultOrderProps,
        state: SmartOrderStatus.INDEXED,
        rejectedReason: ORDER_REJECTED_REASON,
        isExpired: true,
      },
      creation: { ...defaultProps.creation, failed: false },
    },
  },
  {
    description: `[REJECTED+EXPIRED] 2. Refunding`,
    props: {
      ...defaultProps,
      order: {
        ...defaultOrderProps,
        state: SmartOrderStatus.INDEXED,
        rejectedReason: ORDER_REJECTED_REASON,
        isExpired: true,
      },
      creation: { ...defaultProps.creation, failed: false },
      refund: { hash: TX },
    },
  },
  {
    description: `[REJECTED+EXPIRED] 3. Refunded`,
    props: {
      ...defaultProps,
      order: {
        ...defaultOrderProps,
        state: SmartOrderStatus.INDEXED,
        rejectedReason: ORDER_REJECTED_REASON,
        isExpired: true,
      },
      creation: { ...defaultProps.creation, failed: false },
      refund: { hash: TX, failed: false },
    },
  },
  {
    description: '[CANCEL+EXPIRED] 1. Expired and Canceling',
    props: {
      ...defaultProps,
      order: {
        ...defaultOrderProps,
        state: SmartOrderStatus.INDEXED,
        isExpired: true,
      },
      creation: { ...defaultProps.creation, failed: false },
      cancellation: { hash: TX },
    },
  },
  {
    description: '[CANCEL+EXPIRED] 2. Expired and Canceled',
    props: {
      ...defaultProps,
      order: {
        ...defaultOrderProps,
        state: SmartOrderStatus.INDEXED,
        isExpired: true,
      },
      creation: { ...defaultProps.creation, failed: false },
      cancellation: { hash: TX, failed: false },
    },
  },
  {
    description: '[CANCEL+REFUND] Cancelling... + Refunding....',
    props: {
      ...defaultProps,
      order: {
        ...defaultOrderProps,
        state: SmartOrderStatus.INDEXED,
        isExpired: true,
      },
      creation: { ...defaultProps.creation, failed: false },
      cancellation: { hash: TX },
      refund: { hash: TX },
    },
  },
  {
    description: '[CANCEL+REFUND] Cancelling... + Refunded',
    props: {
      ...defaultProps,
      order: {
        ...defaultOrderProps,
        state: SmartOrderStatus.INDEXED,
        isExpired: true,
      },
      creation: { ...defaultProps.creation, failed: false },
      cancellation: { hash: TX },
      refund: { hash: TX, failed: false },
    },
  },
  {
    description: '[CANCEL+REFUND] Canceled + Refunding...',
    props: {
      ...defaultProps,
      order: {
        ...defaultOrderProps,
        state: SmartOrderStatus.INDEXED,
        isExpired: true,
      },
      creation: { ...defaultProps.creation, failed: false },
      cancellation: { hash: TX, failed: false },
      refund: { hash: TX },
    },
  },
  {
    description: '[CANCEL+REFUND] Canceled + Refunded',
    props: {
      ...defaultProps,
      order: {
        ...defaultOrderProps,
        state: SmartOrderStatus.INDEXED,
        isExpired: true,
      },
      creation: { ...defaultProps.creation, failed: false },
      cancellation: { hash: TX, failed: false },
      refund: { hash: TX, failed: false },
    },
  },
  {
    description: '[EXPIRED-BEFORE-CREATION] Expired before Create transaction is Mined',
    props: {
      ...defaultProps,
      order: {
        ...defaultOrderProps,
        state: SmartOrderStatus.CREATING,
        isExpired: true,
      },
      creation: { ...defaultProps.creation, failed: false },
    },
  },
  {
    description: '[EXPIRED-BEFORE-CREATION] Expired when Create transaction is Mined (before indexing)',
    props: {
      ...defaultProps,
      order: {
        ...defaultOrderProps,
        state: SmartOrderStatus.CREATION_MINED,
        isExpired: true,
      },
      creation: { ...defaultProps.creation, failed: false },
    },
  },
  {
    description: '[TX-FAILED-CREATION] Creation tx failed',
    props: {
      ...defaultProps,
      order: {
        ...defaultOrderProps,
        state: SmartOrderStatus.CREATING,
        isExpired: false,
        rejectedReason: 'Transaction failed',
      },
      creation: { ...defaultProps.creation, failed: true },
    },
  },
  {
    description: '[TX-FAILED-CANCELLATION] Cancellation tx failed - refund succeeded',
    props: {
      ...defaultProps,
      order: {
        ...defaultOrderProps,
        state: SmartOrderStatus.INDEXED,
        isExpired: true,
      },
      creation: { ...defaultProps.creation, failed: false },
      cancellation: { hash: TX, failed: true },
      refund: { failed: false },
    },
  },
  {
    description: '[TX-FAILED-CANCELLATION] Cancellation tx failed - order filled',
    props: {
      ...defaultProps,
      order: {
        ...defaultOrderProps,
        state: SmartOrderStatus.FILLED,
        isExpired: false,
      },
      creation: { ...defaultProps.creation, failed: false },
      cancellation: { hash: TX, failed: true },
    },
  },
  {
    description: '[TX-FAILED-REFUND] Refund tx failed (can it?)',
    props: {
      ...defaultProps,
      order: {
        ...defaultOrderProps,
        state: SmartOrderStatus.INDEXED,
        isExpired: true,
      },
      creation: { ...defaultProps.creation, failed: false },
      refund: { hash: TX, failed: true },
    },
  },
]

const STEPS_BY_DESCRIPTION = STEPS.reduce<{ [description: string]: EthFlowStepperProps }>((acc, step) => {
  acc[step.description] = step.props
  return acc
}, {})

const Wrapper = styled.div`
  width: 80%;
  margin: 20px auto;
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function Fixture() {
  const [stepDescription] = useSelect('steps', {
    options: STEPS.map((step) => step.description),
  })
  const props = STEPS_BY_DESCRIPTION[stepDescription]

  return (
    <Wrapper>
      <EthFlowStepper {...props} />
      <h3>Params</h3>
      <div>
        <pre>{JSON.stringify(props, null, 2)}</pre>
      </div>
    </Wrapper>
  )
}

export default Fixture
