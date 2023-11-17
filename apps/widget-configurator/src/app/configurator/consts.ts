import { TradeType } from '@cowprotocol/widget-lib'

export const TRADE_MODES = [TradeType.SWAP, TradeType.LIMIT, TradeType.ADVANCED]

// TODO: Move default palette to a new lib that only exposes the palette colors.
// This wayit can be consumed by both the configurator and the widget.
export const DEFAULT_LIGHT_PALETTE = {
  primary: '#3f51b5',
  secondary: '#f50057',
  background: '#ffffff',
  paper: '#f5f5f5',
  text: '#000000',
  error: '#f44336',
  warning: '#ff9800',
  info: '#2196f3',
  success: '#4caf50',
}

export const DEFAULT_DARK_PALETTE = {
  primary: '#3f51b5',
  secondary: '#f50057',
  background: '#303030',
  paper: '#424242',
  text: '#ffffff',
  error: '#f44336',
  warning: '#ff9800',
  info: '#2196f3',
  success: '#4caf50',
}
