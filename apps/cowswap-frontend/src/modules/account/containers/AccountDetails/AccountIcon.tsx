import { useState } from 'react'

import { HoverTooltip } from '@cowprotocol/ui'
import { Identicon, getWeb3ReactConnection, WalletDetails, getConnectionIcon } from '@cowprotocol/wallet'
import { Connector } from '@web3-react/types'

import { IconWrapper } from './styled'

interface AccountIconProps {
  connector: Connector
  walletDetails?: WalletDetails
  size?: number
  account?: string
}

export const AccountIcon = ({ connector, walletDetails, size = 16, account }: AccountIconProps) => {
  const [imageLoadError, setImageLoadError] = useState(false)
  const connectionType = getWeb3ReactConnection(connector)
  const iconURL = walletDetails?.icon || getConnectionIcon(connectionType.type)
  const isIdenticon = iconURL === 'Identicon'

  if (imageLoadError || isIdenticon) {
    return (
      <IconWrapper size={size}>
        <Identicon size={size} account={account} />
      </IconWrapper>
    )
  }

  if (walletDetails && !walletDetails.isSupportedWallet) {
    return (
      <HoverTooltip wrapInContainer  content="This wallet is not yet supported">
        <IconWrapper role="img" aria-label="Warning sign. Wallet not supported">
          ⚠️
        </IconWrapper>
      </HoverTooltip>
    )
  }

  return (
    <IconWrapper size={size}>
      <img src={iconURL} alt={`${connectionType.type} logo`} onError={() => setImageLoadError(true)} />
    </IconWrapper>
  )
}
