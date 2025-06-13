import { cowSwapStore } from '../../../../legacy/state'
import { addTransaction, finalizeTransaction } from '../../../../legacy/state/enhancedTransactions/actions'
import { HashType } from '../../../../legacy/state/enhancedTransactions/reducer'

export const WrapPendingTxHashMock = '0xe87e1d02b052daa9605abe018e8172feffd1bc38ed2284e6f9d7fdb065440bbb'
export const WrapSuccessfulTxHashMock = '0xe87e1d02b052daa9605abe018e8172feffd1bc38ed2284e6f9d7fdb065440ccc'
export const WrapErrorTxHashMock = '0xe87e1d02b052daa9605abe018e8172feffd1bc38ed2284e6f9d7fdb065440eee'

export const ApprovePendingTxHashMock = '0x138b032570b443508a0a102f1d15949401acf2b83ed377f1343432908901bbbb'
export const ApproveSuccessfulTxHashMock = '0x138b032570b443508a0a102f1d15949401acf2b83ed377f1343432908901cccc'
export const ApproveErrorTxHashMock = '0x138b032570b443508a0a102f1d15949401acf2b83ed377f1343432908901eeee'

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function mockEthFlowPendingTxs() {
  // Wrap transactions
  cowSwapStore.dispatch(
    addTransaction({
      nonce: 1,
      hash: WrapPendingTxHashMock,
      hashType: HashType.ETHEREUM_TX,
      from: '0xfb3c7eb936cAA12B5A884d612393969A557d4307',
      chainId: 5,
      summary: 'Wrap 0.02 WETH to Ether',
    }),
  )

  cowSwapStore.dispatch(
    addTransaction({
      nonce: 1,
      hash: WrapSuccessfulTxHashMock,
      hashType: HashType.ETHEREUM_TX,
      from: '0xfb3c7eb936cAA12B5A884d612393969A557d4307',
      chainId: 5,
      summary: 'Wrap 0.02 WETH to Ether',
    }),
  )
  cowSwapStore.dispatch(
    finalizeTransaction({
      hash: WrapSuccessfulTxHashMock,
      chainId: 5,
      receipt: {
        to: '',
        from: '',
        contractAddress: '',
        transactionIndex: 1,
        blockHash: '',
        transactionHash: '',
        blockNumber: 1,
        status: 1,
      },
    }),
  )

  cowSwapStore.dispatch(
    addTransaction({
      nonce: 1,
      hash: WrapErrorTxHashMock,
      hashType: HashType.ETHEREUM_TX,
      from: '0xfb3c7eb936cAA12B5A884d612393969A557d4307',
      chainId: 5,
      summary: 'Wrap 0.02 WETH to Ether',
    }),
  )
  cowSwapStore.dispatch(
    finalizeTransaction({
      hash: WrapErrorTxHashMock,
      chainId: 5,
      receipt: {
        to: '',
        from: '',
        contractAddress: '',
        transactionIndex: 1,
        blockHash: '',
        transactionHash: '',
        blockNumber: 1,
        status: 3, // Error
      },
    }),
  )

  // Approve transactions
  cowSwapStore.dispatch(
    addTransaction({
      nonce: 1,
      hash: ApprovePendingTxHashMock,
      hashType: HashType.ETHEREUM_TX,
      from: '0xfb3c7eb936cAA12B5A884d612393969A557d4307',
      chainId: 5,
      approval: {
        tokenAddress: '0x02ABBDbAaa7b1BB64B5c878f7ac17f8DDa169532',
        spender: '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110',
        amount: '0x1',
      },
      summary: 'Approve GNO',
    }),
  )

  cowSwapStore.dispatch(
    addTransaction({
      nonce: 1,
      hash: ApproveSuccessfulTxHashMock,
      hashType: HashType.ETHEREUM_TX,
      from: '0xfb3c7eb936cAA12B5A884d612393969A557d4307',
      chainId: 5,
      approval: {
        tokenAddress: '0x02ABBDbAaa7b1BB64B5c878f7ac17f8DDa169532',
        spender: '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110',
        amount: '0x1',
      },
      summary: 'Approve GNO',
    }),
  )
  cowSwapStore.dispatch(
    finalizeTransaction({
      hash: ApproveSuccessfulTxHashMock,
      chainId: 5,
      receipt: {
        to: '',
        from: '',
        contractAddress: '',
        transactionIndex: 1,
        blockHash: '',
        transactionHash: '',
        blockNumber: 1,
        status: 1,
      },
    }),
  )

  cowSwapStore.dispatch(
    addTransaction({
      nonce: 1,
      hash: ApproveErrorTxHashMock,
      hashType: HashType.ETHEREUM_TX,
      from: '0xfb3c7eb936cAA12B5A884d612393969A557d4307',
      chainId: 5,
      approval: {
        tokenAddress: '0x02ABBDbAaa7b1BB64B5c878f7ac17f8DDa169532',
        spender: '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110',
        amount: '0x1',
      },
      summary: 'Approve GNO',
    }),
  )
  cowSwapStore.dispatch(
    finalizeTransaction({
      hash: ApproveErrorTxHashMock,
      chainId: 5,
      receipt: {
        to: '',
        from: '',
        contractAddress: '',
        transactionIndex: 1,
        blockHash: '',
        transactionHash: '',
        blockNumber: 1,
        status: 3, // Error
      },
    }),
  )
}
