import { default as AmbireImage } from 'modules/wallet/api/assets/ambire.svg'
import { getIsAmbireWallet } from 'modules/wallet/api/utils/connection'

import { ConnectionType } from '../../api/types'
import { WalletConnectLabeledOption } from '../containers/WalletConnectLabeledOption'

import { TryActivation } from '.'

const ambireOption = {
  color: '#4196FC',
  icon: AmbireImage,
  id: 'ambire',
}

export function AmbireOption({ tryActivation }: { tryActivation: TryActivation }) {
  return (
    <WalletConnectLabeledOption
      options={ambireOption}
      checkWalletName={getIsAmbireWallet}
      tryActivation={tryActivation}
      connectionType={ConnectionType.AMBIRE}
    />
  )
}
