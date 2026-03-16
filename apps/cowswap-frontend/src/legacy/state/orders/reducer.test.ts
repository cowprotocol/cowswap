import { USDC_MAINNET as USDC, USDT } from '@cowprotocol/common-const'
import { EnrichedOrder, SupportedChainId } from '@cowprotocol/cow-sdk'

import {
  addOrUpdateOrders,
  addPendingOrder,
  cancelOrdersBatch,
  expireOrdersBatch,
  fulfillOrdersBatch,
  OrderStatus,
  requestOrderCancellation,
  SerializedOrder,
} from './actions'
import { generateOrder } from './mocks'
import reducer, { OrdersState } from './reducer'

const CHAIN_ID = SupportedChainId.MAINNET
const sellToken = USDT
const buyToken = USDC

describe('orders reducer', () => {
  /*
     * isCancelling is a local-only flag - the CoW API has no knowledge of it.
     * It is set via requestOrderCancellation and must survive API refetches
     * until the order reaches a terminal state (cancelled, expired, fulfilled).

     * This is especially relevant for Safe wallets, where there is a a gap between
     * signing the cancellation tx and executing it onchain. During that gap,
     * the API still sees the order as pending with isCancelling: false.
    */
  describe('isCancelling preservation', () => {
    /*
     * Reusable setup: place a Safe order and marks it as cancelling locally
     */
    function setupCancellingOrder(): { state: OrdersState; order: ReturnType<typeof generateOrder> } {
      // add pending order
      let state = reducer(undefined, { type: '@@INIT' })
      const order = generateOrder({ owner: '0x...', sellToken, buyToken })
      state = reducer(
        state,
        addPendingOrder({
          id: order.id,
          chainId: CHAIN_ID,
          order: order as unknown as SerializedOrder,
          isSafeWallet: true,
        }),
      )

      // user initiates cancellation
      state = reducer(state, requestOrderCancellation({ id: order.id, chainId: CHAIN_ID }))
      return { state, order }
    }

    it('normal case add pending order, isCancelling should be false', () => {
      let state = reducer(undefined, { type: '@@INIT' })
      const order = generateOrder({ owner: '0x...', sellToken, buyToken })
      state = reducer(
        state,
        addPendingOrder({
          id: order.id,
          chainId: CHAIN_ID,
          order: order as unknown as SerializedOrder,
          isSafeWallet: true,
        }),
      )
      expect(state[CHAIN_ID]?.pending[order.id]?.order.isCancelling).toBeUndefined()
    })

    it('add pending order then request cancellation on EOA, isCancelling should be preserved', () => {
      let state = reducer(undefined, { type: '@@INIT' })
      const order = generateOrder({ owner: '0x...', sellToken, buyToken })
      state = reducer(
        state,
        addPendingOrder({
          id: order.id,
          chainId: CHAIN_ID,
          order: order as unknown as SerializedOrder,
          isSafeWallet: false,
        }),
      )
      state = reducer(state, requestOrderCancellation({ id: order.id, chainId: CHAIN_ID }))
      const apiOrder: SerializedOrder = {
        ...(order as unknown as SerializedOrder),
        status: OrderStatus.PENDING,
        isCancelling: false, // API doesn't know about the cancellation yet
      }
      state = reducer(state, addOrUpdateOrders({ chainId: CHAIN_ID, orders: [apiOrder], isSafeWallet: false }))
      // isCancelling should still be true, but if the reducer doesn't preserve it, it will be overwritten to false by the API update
      expect(state[CHAIN_ID]?.pending[order.id]?.order.isCancelling).toBe(true)
    })

    it('add pending order then request cancellation on safe, isCancelling should be true', () => {
      const { state, order } = setupCancellingOrder()
      expect(state[CHAIN_ID]?.pending[order.id]?.order.isCancelling).toBe(true)
    })

    it('add pending order then request cancellation on safe, but API returns updated order, isCancelling should be preserved', () => {
      const { state: initialState, order } = setupCancellingOrder()
      let state = initialState
      const apiOrder: SerializedOrder = {
        ...(order as unknown as SerializedOrder),
        status: OrderStatus.PENDING,
        isCancelling: false, // API doesn't know about the cancellation yet
      }
      state = reducer(state, addOrUpdateOrders({ chainId: CHAIN_ID, orders: [apiOrder], isSafeWallet: true }))
      // isCancelling should still be true, but if the reducer doesn't preserve it, it will be overwritten to false by the API update
      expect(state[CHAIN_ID]?.pending[order.id]?.order.isCancelling).toBe(true)
    })

    it('order fully cancelled onchain via cancelOrdersBatch, should move to cancelled bucket and clear isCancelling', () => {
      const { state, order } = setupCancellingOrder()
      const finalState = reducer(state, cancelOrdersBatch({ chainId: CHAIN_ID, ids: [order.id], isSafeWallet: true }))

      // order is removed from pending bucket
      expect(finalState[CHAIN_ID]?.pending[order.id]).toBeUndefined()
      // order is added to cancelled bucket with isCancelling cleared
      expect(finalState[CHAIN_ID]?.cancelled[order.id]).toBeDefined()
      const cancelledOrder = finalState[CHAIN_ID]?.cancelled[order.id]?.order
      // isCancelling should be cleared when order is fully cancelled onchain
      expect(cancelledOrder?.isCancelling).toBe(false)
      // status should be updated to cancelled
      expect(cancelledOrder?.status).toBe(OrderStatus.CANCELLED)
    })

    it('expireOrdersBatch clears isCancelling even when it was set', () => {
      const { state, order } = setupCancellingOrder()
      const finalState = reducer(state, expireOrdersBatch({ chainId: CHAIN_ID, ids: [order.id], isSafeWallet: true }))
      // order is removed from pending bucket
      expect(finalState[CHAIN_ID]?.pending[order.id]).toBeUndefined()
      // order is added to expired bucket with isCancelling cleared
      expect(finalState[CHAIN_ID]?.expired[order.id]?.order.isCancelling).toBe(false)
    })

    it('fulfillOrdersBatch clears isCancelling even when it was set', () => {
      const { state, order } = setupCancellingOrder()
      const finalState = reducer(
        state,
        fulfillOrdersBatch({
          chainId: CHAIN_ID,
          orders: [{ uid: order.id } as unknown as EnrichedOrder],
          isSafeWallet: true,
        }),
      )
      // order is removed from pending bucket
      expect(finalState[CHAIN_ID]?.pending[order.id]).toBeUndefined()
      // order is added to fulfilled bucket with isCancelling cleared
      expect(finalState[CHAIN_ID]?.fulfilled[order.id]?.order.isCancelling).toBe(false)
    })

    it('addOrUpdateOrders for a brand new order uses API isCancelling as is', () => {
      let state = reducer(undefined, { type: '@@INIT' })
      const order = generateOrder({ owner: '0x...', sellToken, buyToken })
      const apiOrder: SerializedOrder = {
        ...(order as unknown as SerializedOrder),
        status: OrderStatus.PENDING,
        isCancelling: false,
      }
      state = reducer(state, addOrUpdateOrders({ chainId: CHAIN_ID, orders: [apiOrder], isSafeWallet: false }))
      // no existing state to preserve, so API value is used directly
      expect(state[CHAIN_ID]?.pending[order.id]?.order.isCancelling).toBe(false)
    })

    it('addOrUpdateOrders does not resurrect a cancelled order', () => {
      const { state, order } = setupCancellingOrder()
      // fully cancel the order onchain
      let finalState = reducer(state, cancelOrdersBatch({ chainId: CHAIN_ID, ids: [order.id], isSafeWallet: true }))
      // api tries to re-add it as pending
      const apiOrder: SerializedOrder = {
        ...(order as unknown as SerializedOrder),
        status: OrderStatus.PENDING,
        isCancelling: false,
      }
      finalState = reducer(finalState, addOrUpdateOrders({ chainId: CHAIN_ID, orders: [apiOrder], isSafeWallet: true }))
      // order should still be in cancelled bucket, not moved back to pending
      expect(finalState[CHAIN_ID]?.cancelled[order.id]).toBeDefined()
      expect(finalState[CHAIN_ID]?.pending[order.id]).toBeUndefined()
    })
  })
})
