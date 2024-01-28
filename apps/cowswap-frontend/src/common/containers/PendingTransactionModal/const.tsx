export const PENDING_TX_DESCRIPTIONS = {
  APPROVE: 'Approving token',
  CANCEL_ORDER: 'Canceling your order',
}

export const PENDING_TX_NAMES = {
  APPROVE: 'token approval',
  CANCELLATION: 'cancellation',
}
export const PENDING_TX_TITLES = {
  APPROVE: (tokenSymbol: string) => (
    <>
      Approving <strong>{tokenSymbol}</strong> for trading
    </>
  ),
  MULTIPLE_CANCEL: (ordersCount: number) => <>Cancelling {ordersCount} orders</>,
}
