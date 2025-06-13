import { useState } from 'react'

import { HoverTooltip } from '@cowprotocol/ui'
import { useConnectionType, useWalletDetails } from '@cowprotocol/wallet'

import { StatusIcon } from 'modules/wallet/pure/StatusIcon'

import { IconWrapper } from './styled'

interface AccountIconProps {
  size?: number
  account?: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const AccountIcon = ({ size = 16, account }: AccountIconProps) => {
  const walletDetails = useWalletDetails()
  const connectionType = useConnectionType()
  const [imageLoadError, setImageLoadError] = useState(false)

  const { icon, walletName } = walletDetails
  const isIdenticon = icon === 'Identicon'

  if (imageLoadError || isIdenticon || !icon) {
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
      <img src={icon} alt={walletName || connectionType} onError={() => setImageLoadError(true)} />
    </IconWrapper>
  )
}
