import { createMulticall /*, ListenerOptions */ } from '@uniswap/redux-multicall'

import { combineReducers, createStore } from 'redux'

import { useInterfaceMulticall } from 'legacy/hooks/useContract'

import { useWalletInfo } from 'modules/wallet'

import useBlockNumber from 'lib/hooks/useBlockNumber'

const multicall = createMulticall()
const reducer = combineReducers({ [multicall.reducerPath]: multicall.reducer })
export const store = createStore(reducer)

export default multicall

export function MulticallUpdater() {
  const { chainId } = useWalletInfo()
  const latestBlockNumber = useBlockNumber()
  const contract = useInterfaceMulticall()

  return <multicall.Updater chainId={chainId} latestBlockNumber={latestBlockNumber} contract={contract} />
}
