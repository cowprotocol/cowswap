import { initializeConnector } from '@web3-react/core'
import { Connector } from '@web3-react/types'

import { default as TallyImage } from '../../api/assets/tally.svg'
import { ConnectWalletOption } from '../../api/pure/ConnectWalletOption'
import { ConnectionType } from '../../api/types'
import { getConnectionName } from '../../api/utils/connection'
import { InjectedWallet } from '../connectors/Injected'
import { useIsActiveConnection } from '../hooks/useIsActiveConnection'
import { ConnectionOptionProps, Web3ReactConnection } from '../types'

const WALLET_LINK = 'https://chrome.google.com/webstore/detail/taho/eajafomhmkipbjmfmhebemolkcicgfmd'
const BASE_PROPS = {
  color: '#4196FC',
  icon: TallyImage,
  id: 'tally',
}

const [tallyWallet, tallyWalletHooks] = initializeConnector<Connector>(
  (actions) =>
    new InjectedWallet({
      actions,
      walletUrl: WALLET_LINK,
      searchKeywords: ['isTally', 'isTallyWallet', 'isTallyHo'],
    })
)
export const tallyWalletConnection: Web3ReactConnection = {
  connector: tallyWallet,
  hooks: tallyWalletHooks,
  type: ConnectionType.TALLY,
}

export function TallyWalletOption({ selectedWallet, tryActivation }: ConnectionOptionProps) {
  const isActive = useIsActiveConnection(selectedWallet, tallyWalletConnection)

  return (
    <ConnectWalletOption
      {...BASE_PROPS}
      isActive={isActive}
      onClick={() => tryActivation(tallyWalletConnection.connector)}
      header={getConnectionName(ConnectionType.TALLY)}
    />
  )
}
