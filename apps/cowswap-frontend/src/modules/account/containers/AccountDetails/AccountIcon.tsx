import { useState } from 'react'

import { HoverTooltip } from '@cowprotocol/ui'
import { useConnectionType, useWalletDetails } from '@cowprotocol/wallet'

import { StatusIcon } from 'modules/wallet/pure/StatusIcon'

import { IconWrapper } from './styled'

interface AccountIconProps {
  size?: number
  account?: string
}

export const AccountIcon = ({ size = 16, account }: AccountIconProps) => {
  const walletDetails = useWalletDetails()
  const connectionType = useConnectionType()
  const [imageLoadError, setImageLoadError] = useState(false)

  const iconURL = walletDetails?.icon
  const isIdenticon = iconURL === 'Identicon'

  if (imageLoadError || isIdenticon || !iconURL) {
    return (
      <IconWrapper size={size}>
        <StatusIcon size={size} account={account} connectionType={connectionType} />
      </IconWrapper>
    )
  }

  if (walletDetails && !walletDetails.isSupportedWallet) {
    return (
      <HoverTooltip wrapInContainer content="This wallet is not yet supported">
        <IconWrapper role="img" aria-label="Warning sign. Wallet not supported">
          ⚠️
        </IconWrapper>
      </HoverTooltip>
    )
  }

  return (
    <IconWrapper size={size}>
      <img src={iconURL} alt="wallet logo" onError={() => setImageLoadError(true)} />
    </IconWrapper>
  )
}
