import { Identicon, ConnectionType } from '@cowprotocol/wallet'
import { CoinbaseWalletIcon, WalletConnectIcon } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

const IconWrapper = styled.div<{ size?: number }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;

  & > img,
  span {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }
`

export interface StatusIconProps {
  connectionType: ConnectionType
  account?: string
  size?: number
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function StatusIcon({ connectionType, account, size = 16 }: StatusIconProps) {
  let image
  switch (connectionType) {
    case ConnectionType.INJECTED:
      image = <Identicon account={account} />
      break
    case ConnectionType.WALLET_CONNECT_V2:
      image = <img src={WalletConnectIcon} alt="WalletConnect" />
      break
    case ConnectionType.COINBASE_WALLET:
      image = <img src={CoinbaseWalletIcon} alt="Coinbase Wallet" />
      break
  }

  return <IconWrapper size={size}>{image}</IconWrapper>
}
