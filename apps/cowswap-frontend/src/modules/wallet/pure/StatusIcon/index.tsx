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
}

export function StatusIcon({ connectionType }: StatusIconProps) {
  let image
  switch (connectionType) {
    case ConnectionType.INJECTED:
      image = <Identicon />
      break
    case ConnectionType.WALLET_CONNECT_V2:
      image = <img src={WalletConnectIcon} alt="WalletConnect" />
      break
    case ConnectionType.COINBASE_WALLET:
      image = <img src={CoinbaseWalletIcon} alt="Coinbase Wallet" />
      break
  }

  return <IconWrapper size={16}>{image}</IconWrapper>
}
