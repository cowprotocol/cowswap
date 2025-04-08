import { getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Connector } from '@web3-react/types'

const defaultChainId = getCurrentChainIdFromUrl()

export class PrivyConnector extends Connector {
  async activate(
    chainId: SupportedChainId | { chainId: SupportedChainId } = defaultChainId,
    indexChanged = false,
  ): Promise<void> {
    console.log('PrivyConnector activate', chainId, indexChanged)
  }
}
