import { default as AmbireImage } from '../../api/assets/ambire.svg'
import { ConnectionType } from '../../api/types'
import { getIsAmbireWallet } from '../../api/utils/connection'
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
