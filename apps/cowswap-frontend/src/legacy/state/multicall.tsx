import { useInterfaceMulticall, useBlockNumber } from '@cowprotocol/common-hooks'
import { createMulticall } from '@uniswap/redux-multicall'
import { useWeb3React } from '@web3-react/core'

export const multicall = createMulticall()

export function MulticallUpdater() {
  const { chainId } = useWeb3React()
  const latestBlockNumber = useBlockNumber()
  const contract = useInterfaceMulticall()

  return <multicall.Updater chainId={chainId} latestBlockNumber={latestBlockNumber} contract={contract} />
}
