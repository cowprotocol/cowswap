import { useInterfaceMulticall, useBlockNumber } from '@cowswap/common-hooks'
import { createMulticall } from '@uniswap/redux-multicall'
import { useWeb3React } from '@web3-react/core'

import { combineReducers, createStore } from 'redux'

export const multicall = createMulticall()
const reducer = combineReducers({ [multicall.reducerPath]: multicall.reducer })
export const store = createStore(reducer)

export function MulticallUpdater() {
  const { chainId } = useWeb3React()
  const latestBlockNumber = useBlockNumber()
  const contract = useInterfaceMulticall()

  return <multicall.Updater chainId={chainId} latestBlockNumber={latestBlockNumber} contract={contract} />
}
