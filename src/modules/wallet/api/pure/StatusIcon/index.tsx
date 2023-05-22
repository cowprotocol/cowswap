import { ConnectionType } from 'modules/wallet'
import styled from 'styled-components/macro'

import CoinbaseWalletIcon from 'modules/wallet/api/assets/coinbase.svg'
import FortmaticIcon from 'modules/wallet/api/assets/formatic.png'
import WalletConnectIcon from 'modules/wallet/api/assets/walletConnectIcon.svg'
import { Identicon } from 'modules/wallet/api/container/Identicon'

const IconWrapper = styled.div<{ size?: number }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  & > img,
  span {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: flex-end;
  `};
`

export interface StatusIconProps {
  connectionType: ConnectionType
}

export default function StatusIcon({ connectionType }: StatusIconProps) {
  let image
  switch (connectionType) {
    case ConnectionType.INJECTED:
      image = <Identicon />
      break
    case ConnectionType.WALLET_CONNECT:
      image = <img src={WalletConnectIcon} alt="WalletConnect" />
      break
    case ConnectionType.COINBASE_WALLET:
      image = <img src={CoinbaseWalletIcon} alt="Coinbase Wallet" />
      break
    case ConnectionType.FORTMATIC:
      image = <img src={FortmaticIcon} alt="Fortmatic" />
      break
  }

  return <IconWrapper size={16}>{image}</IconWrapper>
}
