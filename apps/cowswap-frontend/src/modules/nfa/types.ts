export enum MessageType {
  BUY_ORDER = 'buy order',
  BUY_USERS = 'buy users',
  SELL_ORDER = 'sell order',
  SELL_USERS = 'sell users',
}

export interface NfaSourceData {
  message: MessageType
  token: string
  percent: number
  rank_number: string // number
}
