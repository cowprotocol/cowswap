import { useActiveWeb3React } from 'hooks/web3'
import { switchParamsByNetwork } from '../../utils/xdai/hack'

export default function Updater(): null {
  const { chainId } = useActiveWeb3React()

  // Apply xDAI hack
  switchParamsByNetwork(chainId)

  return null
}
