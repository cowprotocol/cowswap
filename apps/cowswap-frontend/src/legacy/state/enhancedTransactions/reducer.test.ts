import { createStore, Store } from 'redux'

import { addTransaction, checkedTransaction, clearAllTransactions, finalizeTransaction } from './actions'
import reducer, { HashType, initialState, EnhancedTransactionState } from './reducer'

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
describe('transaction reducer', () => {
  let store: Store<EnhancedTransactionState>

  beforeEach(() => {
    store = createStore(reducer, initialState)
  })

  describe('addTransaction', () => {
    it('adds the transaction', () => {
      const beforeTime = new Date().getTime()
      const approval = { tokenAddress: 'abc', spender: 'def', amount: '0x1' }

      store.dispatch(
        addTransaction({
          hash: '0x0',
          hashType: HashType.ETHEREUM_TX,
          chainId: 1,
          summary: 'hello world',
          approval,
          from: 'abc',
        })
      )
      const txs = store.getState()
      expect(txs[1]).toBeTruthy()
      expect(txs[1]?.['0x0']).toBeTruthy()
      const tx = txs[1]?.['0x0']
      expect(tx).toBeTruthy()
      expect(tx?.hash).toEqual('0x0')
      expect(tx?.summary).toEqual('hello world')
      expect(tx?.approval).toEqual(approval)
      expect(tx?.from).toEqual('abc')
      expect(tx?.addedTime).toBeGreaterThanOrEqual(beforeTime)
    })
  })

  // TODO: Break down this large function into smaller functions
  // eslint-disable-next-line max-lines-per-function
  describe('finalizeTransaction', () => {
    it('no op if not valid transaction', () => {
      store.dispatch(
        finalizeTransaction({
          chainId: 4,
          hash: '0x0',
          receipt: {
            status: 1,
            transactionIndex: 1,
            transactionHash: '0x0',
            to: '0x0',
            from: '0x0',
            contractAddress: '0x0',
            blockHash: '0x0',
            blockNumber: 1,
          },
        })
      )
      expect(store.getState()).toEqual({})
    })
    it('sets receipt', () => {
      store.dispatch(
        addTransaction({
          hash: '0x0',
          hashType: HashType.ETHEREUM_TX,
          chainId: 4,
          approval: { spender: '0x0', tokenAddress: '0x0', amount: '0x1' },
          summary: 'hello world',
          from: '0x0',
        })
      )
      const beforeTime = new Date().getTime()
      store.dispatch(
        finalizeTransaction({
          chainId: 4,
          hash: '0x0',
          receipt: {
            status: 1,
            transactionIndex: 1,
            transactionHash: '0x0',
            to: '0x0',
            from: '0x0',
            contractAddress: '0x0',
            blockHash: '0x0',
            blockNumber: 1,
          },
        })
      )
      const tx = store.getState()[4]?.['0x0']
      expect(tx?.summary).toEqual('hello world')
      expect(tx?.confirmedTime).toBeGreaterThanOrEqual(beforeTime)
      expect(tx?.receipt).toEqual({
        status: 1,
        transactionIndex: 1,
        transactionHash: '0x0',
        to: '0x0',
        from: '0x0',
        contractAddress: '0x0',
        blockHash: '0x0',
        blockNumber: 1,
      })
    })
  })

  // TODO: Break down this large function into smaller functions
  // eslint-disable-next-line max-lines-per-function
  describe('checkedTransaction', () => {
    it('no op if not valid transaction', () => {
      store.dispatch(
        checkedTransaction({
          chainId: 4,
          hash: '0x0',
          blockNumber: 1,
        })
      )
      expect(store.getState()).toEqual({})
    })
    it('sets lastCheckedBlockNumber', () => {
      store.dispatch(
        addTransaction({
          hash: '0x0',
          hashType: HashType.ETHEREUM_TX,
          chainId: 4,
          approval: { spender: '0x0', tokenAddress: '0x0', amount: '0x1' },
          summary: 'hello world',
          from: '0x0',
        })
      )
      store.dispatch(
        checkedTransaction({
          chainId: 4,
          hash: '0x0',
          blockNumber: 1,
        })
      )
      const tx = store.getState()[4]?.['0x0']
      expect(tx?.lastCheckedBlockNumber).toEqual(1)
    })
    it('never decreases', () => {
      store.dispatch(
        addTransaction({
          hash: '0x0',
          hashType: HashType.ETHEREUM_TX,
          chainId: 4,
          approval: { spender: '0x0', tokenAddress: '0x0', amount: '0x1' },
          summary: 'hello world',
          from: '0x0',
        })
      )
      store.dispatch(
        checkedTransaction({
          chainId: 4,
          hash: '0x0',
          blockNumber: 3,
        })
      )
      store.dispatch(
        checkedTransaction({
          chainId: 4,
          hash: '0x0',
          blockNumber: 1,
        })
      )
      const tx = store.getState()[4]?.['0x0']
      expect(tx?.lastCheckedBlockNumber).toEqual(3)
    })
  })

  describe('clearAllTransactions', () => {
    it('removes all transactions for the chain', () => {
      store.dispatch(
        addTransaction({
          hash: '0x0',
          hashType: HashType.ETHEREUM_TX,
          chainId: 1,
          summary: 'hello world',
          approval: { tokenAddress: 'abc', spender: 'def', amount: '0x1' },
          from: 'abc',
        })
      )
      store.dispatch(
        addTransaction({
          hash: '0x1',
          hashType: HashType.ETHEREUM_TX,
          chainId: 4,
          summary: 'hello world',
          approval: { tokenAddress: 'abc', spender: 'def', amount: '0x1' },
          from: 'abc',
        })
      )
      expect(Object.keys(store.getState())).toHaveLength(2)
      expect(Object.keys(store.getState())).toEqual([String(1), String(4)])
      expect(Object.keys(store.getState()[1] ?? {})).toEqual(['0x0'])
      expect(Object.keys(store.getState()[4] ?? {})).toEqual(['0x1'])
      store.dispatch(clearAllTransactions({ chainId: 1 }))
      expect(Object.keys(store.getState())).toHaveLength(2)
      expect(Object.keys(store.getState())).toEqual([String(1), String(4)])
      expect(Object.keys(store.getState()[1] ?? {})).toEqual([])
      expect(Object.keys(store.getState()[4] ?? {})).toEqual(['0x1'])
    })
  })
})
