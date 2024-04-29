import { Connector } from '@web3-react/types'

import { ConnectWalletOption } from '../../../api/pure/ConnectWalletOption'
import { ConnectionType } from '../../../api/types'
import { getConnectionName } from '../../../api/utils/connection'
import { WC_DISABLED_TEXT } from '../../../constants'
import { walletConnectConnectionV2 } from '../../connection/walletConnectV2'
import { useIsActiveConnection } from '../../hooks/useIsActiveConnection'
import { useWalletMetaData } from '../../hooks/useWalletMetadata'

type TryActivation = (connector: Connector) => void

interface WalletConnectLabeledOptionProps {
  connectionType: ConnectionType
  tryActivation: TryActivation
  checkWalletName(walletName: string | undefined): boolean
  selectedWallet: string | undefined
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
  selectedWallet,
}: WalletConnectLabeledOptionProps) {
  const { walletName } = useWalletMetaData()

  const connection = walletConnectConnectionV2

  const isWalletConnect = useIsActiveConnection(selectedWallet, connection)
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
