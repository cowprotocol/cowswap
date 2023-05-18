import store from 'state'
import { addTransaction, finalizeTransaction } from 'state/enhancedTransactions/actions'
import { HashType } from 'state/enhancedTransactions/reducer'

export const WrapPendingTxHashMock = '0xe87e1d02b052daa9605abe018e8172feffd1bc38ed2284e6f9d7fdb065440bbb'
export const WrapSuccessfulTxHashMock = '0xe87e1d02b052daa9605abe018e8172feffd1bc38ed2284e6f9d7fdb065440ccc'
export const WrapErrorTxHashMock = '0xe87e1d02b052daa9605abe018e8172feffd1bc38ed2284e6f9d7fdb065440eee'

export const ApprovePendingTxHashMock = '0x138b032570b443508a0a102f1d15949401acf2b83ed377f1343432908901bbbb'
export const ApproveSuccessfulTxHashMock = '0x138b032570b443508a0a102f1d15949401acf2b83ed377f1343432908901cccc'
export const ApproveErrorTxHashMock = '0x138b032570b443508a0a102f1d15949401acf2b83ed377f1343432908901eeee'

export function mockEthFlowPendingTxs() {
  // Wrap transactions
  store.dispatch(
    addTransaction({
      hash: WrapPendingTxHashMock,
      hashType: HashType.ETHEREUM_TX,
      from: '0xfb3c7eb936cAA12B5A884d612393969A557d4307',
      chainId: 5,
      summary: 'Wrap 0.02 WETH to Ether',
    })
  )

  store.dispatch(
    addTransaction({
      hash: WrapSuccessfulTxHashMock,
      hashType: HashType.ETHEREUM_TX,
      from: '0xfb3c7eb936cAA12B5A884d612393969A557d4307',
      chainId: 5,
      summary: 'Wrap 0.02 WETH to Ether',
    })
  )
  store.dispatch(
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
    })
  )

  store.dispatch(
    addTransaction({
      hash: WrapErrorTxHashMock,
      hashType: HashType.ETHEREUM_TX,
      from: '0xfb3c7eb936cAA12B5A884d612393969A557d4307',
      chainId: 5,
      summary: 'Wrap 0.02 WETH to Ether',
    })
  )
  store.dispatch(
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
    })
  )

  // Approve transactions
  store.dispatch(
    addTransaction({
      hash: ApprovePendingTxHashMock,
      hashType: HashType.ETHEREUM_TX,
      from: '0xfb3c7eb936cAA12B5A884d612393969A557d4307',
      chainId: 5,
      approval: {
        tokenAddress: '0x02ABBDbAaa7b1BB64B5c878f7ac17f8DDa169532',
        spender: '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110',
      },
      summary: 'Approve GNO',
    })
  )

  store.dispatch(
    addTransaction({
      hash: ApproveSuccessfulTxHashMock,
      hashType: HashType.ETHEREUM_TX,
      from: '0xfb3c7eb936cAA12B5A884d612393969A557d4307',
      chainId: 5,
      approval: {
        tokenAddress: '0x02ABBDbAaa7b1BB64B5c878f7ac17f8DDa169532',
        spender: '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110',
      },
      summary: 'Approve GNO',
    })
  )
  store.dispatch(
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
    })
  )

  store.dispatch(
    addTransaction({
      hash: ApproveErrorTxHashMock,
      hashType: HashType.ETHEREUM_TX,
      from: '0xfb3c7eb936cAA12B5A884d612393969A557d4307',
      chainId: 5,
      approval: {
        tokenAddress: '0x02ABBDbAaa7b1BB64B5c878f7ac17f8DDa169532',
        spender: '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110',
      },
      summary: 'Approve GNO',
    })
  )
  store.dispatch(
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
    })
  )
}
