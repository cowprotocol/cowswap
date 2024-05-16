import { useState } from 'react'

import { HoverTooltip } from '@cowprotocol/ui'
import { Identicon, WalletDetails } from '@cowprotocol/wallet'

import { IconWrapper } from './styled'

interface AccountIconProps {
  walletDetails?: WalletDetails
  size?: number
  account?: string
}

export const AccountIcon = ({ walletDetails, size = 16, account }: AccountIconProps) => {
  const [imageLoadError, setImageLoadError] = useState(false)
  const iconURL = walletDetails?.icon
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
