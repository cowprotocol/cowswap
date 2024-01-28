export const PENDING_TX_DESCRIPTIONS = {
  APPROVE: 'Approving token',
}

export const PENDING_TX_NAMES = {
  APPROVE: 'token approval',
}
export const PENDING_TX_TITLES = {
  APPROVE: (tokenSymbol: string) => (
    <>
      Approving <strong>{tokenSymbol}</strong> for trading
    </>
  ),
}
