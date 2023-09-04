import { useIsActiveWallet } from 'legacy/hooks/useIsActiveWallet'

import { useFeatureFlags } from 'common/hooks/featureFlags/useFeatureFlags'

import { ConnectWalletOption } from '../../../api/pure/ConnectWalletOption'
import { ConnectionType } from '../../../api/types'
import { getConnectionName } from '../../../api/utils/connection'
import { WC_DISABLED_TEXT } from '../../../constants'
import { TryActivation } from '../../connection'
import { walletConnectConnection } from '../../connection/walletConnect'
import { walletConnectConnectionV2 } from '../../connection/walletConnectV2'
import { useWalletMetaData } from '../../hooks/useWalletMetadata'

interface WalletConnectLabeledOptionProps {
  connectionType: ConnectionType
  tryActivation: TryActivation
  checkWalletName(walletName: string | undefined): boolean
  options: {
    color: string
    icon: string
    id: string
  }
}

export function WalletConnectLabeledOption({
  connectionType,
  tryActivation,
  checkWalletName,
  options,
}: WalletConnectLabeledOptionProps) {
  const { walletName } = useWalletMetaData()
  const { walletConnectV1Enabled } = useFeatureFlags()

  const connection = walletConnectV1Enabled ? walletConnectConnection : walletConnectConnectionV2

  const isWalletConnect = useIsActiveWallet(connection)
  const isActive = isWalletConnect && checkWalletName(walletName)
  const tooltipText = !isActive && isWalletConnect ? WC_DISABLED_TEXT : null

  return (
    <ConnectWalletOption
      {...options}
      isActive={isActive}
      tooltipText={tooltipText}
      clickable={!isWalletConnect}
      onClick={() => tryActivation(connection.connector)}
      header={getConnectionName(connectionType)}
    />
  )
}
