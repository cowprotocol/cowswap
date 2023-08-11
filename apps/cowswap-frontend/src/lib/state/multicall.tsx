import { createMulticall /*, ListenerOptions */ } from '@uniswap/redux-multicall'
import { useWeb3React } from '@web3-react/core'

import { combineReducers, createStore } from 'redux'

import { useInterfaceMulticall } from 'legacy/hooks/useContract'

import useBlockNumber from 'lib/hooks/useBlockNumber'

const multicall = createMulticall()
const reducer = combineReducers({ [multicall.reducerPath]: multicall.reducer })
export const store = createStore(reducer)

export default multicall

export function MulticallUpdater() {
  const { chainId } = useWeb3React()
  const latestBlockNumber = useBlockNumber()
  const contract = useInterfaceMulticall()

  return <multicall.Updater chainId={chainId} latestBlockNumber={latestBlockNumber} contract={contract} />
}
