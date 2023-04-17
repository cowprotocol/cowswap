export { ApprovalState } from 'lib/hooks/useApproval'

// function useGetAndTrackApproval(getApproval: ReturnType<typeof useApproval>[1]) {
//   const addTransaction = useTransactionAdder()
//   return useCallback(() => {
//     return getApproval().then((pending) => {
//       if (pending) {
//         const { response, tokenAddress, spenderAddress: spender } = pending
//         addTransaction(response, { type: TransactionType.APPROVAL, tokenAddress, spender })
//       }
//     })
//   }, [addTransaction, getApproval])
// }

// // returns a variable indicating the state of the approval and a function which approves if necessary or early returns
// export function useApproveCallback(
//   amountToApprove?: CurrencyAmount<Currency>,
//   spender?: string
// ): [ApprovalState, () => Promise<void>] {
//   const [approval, getApproval] = useApproval(amountToApprove, spender, useHasPendingApproval)
//   return [approval, useGetAndTrackApproval(getApproval)]
// }

// export function useApprovalOptimizedTrade(
//   trade: Trade<Currency, Currency, TradeType> | undefined,
//   allowedSlippage: Percent
// ) {
//   return useSwapApprovalOptimizedTrade(trade, allowedSlippage, useHasPendingApproval)
// }

// export function useApproveCallbackFromTrade(
//   trade:
//     | V2Trade<Currency, Currency, TradeType>
//     | V3Trade<Currency, Currency, TradeType>
//     | Trade<Currency, Currency, TradeType>
//     | undefined,
//   allowedSlippage: Percent
// ): [ApprovalState, () => Promise<void>] {
//   const [approval, getApproval] = useSwapApproval(trade, allowedSlippage, useHasPendingApproval)
//   return [approval, useGetAndTrackApproval(getApproval)]
// }
