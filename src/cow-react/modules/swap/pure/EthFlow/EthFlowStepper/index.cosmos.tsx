import 'inter-ui' // TODO: We need to do a cosmos wrapper with the global styles! Will reiterate to remove this line

import { EthFlowStepper, EthFlowStepperProps, SmartOrderStatus } from '.'

import { useSelect } from 'react-cosmos/fixture'

const ORDER_ID =
  '0xfc5646178d29fe6412c26aaa216dba86fedcf4ebb1e49d9e3a05c5e58d59cc6a9d98c4ff9724040269bdbe3eb2078fa2cb6a21f8636ecb32'

const TX = '0x183fa3b48c676bf9c5613e3e20b67a7250acc94af8e65dbe57787f47e5e54c75'
const ORDER_REJECTED_REASON = 'Price quote expired'

const defaultOrderProps = {
  createOrderTx: TX,
  orderId: ORDER_ID,
  state: SmartOrderStatus.CREATING,
  isExpired: false,
  isCreated: false,
}
const defaultProps: EthFlowStepperProps = {
  nativeTokenSymbol: 'xDAI',
  tokenLabel: 'USDC',
  order: defaultOrderProps,
  refund: {
    isRefunded: false,
  },
  cancellation: {
    isCancelled: false,
  },
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
      refund: {
        refundTx: TX,
        isRefunded: false,
      },
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
      refund: {
        refundTx: TX,
        isRefunded: true,
      },
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
      refund: {
        refundTx: TX,
        isRefunded: false,
      },
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
      refund: {
        refundTx: TX,
        isRefunded: true,
      },
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
      cancellation: {
        cancellationTx: TX,
        isCancelled: false,
      },
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
      cancellation: {
        cancellationTx: TX,
        isCancelled: true,
      },
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
      refund: {
        refundTx: TX,
        isRefunded: false,
      },
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
      refund: {
        refundTx: TX,
        isRefunded: true,
      },
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
      cancellation: {
        cancellationTx: TX,
        isCancelled: false,
      },
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
      cancellation: {
        cancellationTx: TX,
        isCancelled: true,
      },
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
      cancellation: {
        cancellationTx: TX,
        isCancelled: false,
      },
      refund: {
        refundTx: TX,
        isRefunded: false,
      },
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
      cancellation: {
        cancellationTx: TX,
        isCancelled: false,
      },
      refund: {
        refundTx: TX,
        isRefunded: true,
      },
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
      cancellation: {
        cancellationTx: TX,
        isCancelled: true,
      },
      refund: {
        refundTx: TX,
        isRefunded: false,
      },
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
      cancellation: {
        cancellationTx: TX,
        isCancelled: true,
      },
      refund: {
        refundTx: TX,
        isRefunded: true,
      },
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
      <div>
        <pre>{JSON.stringify(props, null, 2)}</pre>
      </div>
    </>
  )
}

export default Fixture
