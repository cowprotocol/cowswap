import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWeb3React } from '@web3-react/core'

export function ChainIdValidator({ children }: { children: JSX.Element }) {
  const { chainId } = useWeb3React()
  const isChainIdUnsupported = !!chainId && !(chainId in SupportedChainId)

  if (isChainIdUnsupported) {
    return (
      <div>
        <h3>Wrong network</h3>
        {/*TODO*/}
        <button>Change network</button>
      </div>
    )
  }

  return children
}
