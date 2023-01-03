import { useWeb3React } from '@web3-react/core'
import { useCallback, useEffect } from 'react'
import { onWorkerEvent, tokensListWorker } from './index'
import { TokenDto, TokensListsWorkerEvents } from '@cow/modules/tokensList/types'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { getTokensListFromDB } from './tokensList.db'
import { useUpdateAtom } from 'jotai/utils'
import { TokensListState, tokensListState } from './state'
import { deserializeToken } from '@src/state/user/hooks'

function tokensDtoToState(chainId: SupportedChainId, allTokens: TokenDto[]): TokensListState {
  return allTokens.reduce((acc, val) => {
    acc[val.address] = deserializeToken({
      ...val,
      chainId,
    })
    return acc
  }, {} as TokensListState)
}

export function TokensListUpdater() {
  const { chainId } = useWeb3React()
  const updateState = useUpdateAtom(tokensListState)

  const fillStateFromDB = useCallback(
    (chainId: SupportedChainId) => {
      getTokensListFromDB(chainId).then((tokens) => updateState(tokensDtoToState(chainId, tokens)))
    },
    [updateState]
  )

  useEffect(() => {
    if (!tokensListWorker || !chainId) return

    fillStateFromDB(chainId)

    tokensListWorker.postMessage({ event: TokensListsWorkerEvents.NETWORK_CHANGED, data: chainId })

    onWorkerEvent<SupportedChainId>(TokensListsWorkerEvents.NETWORK_CHANGED, (chainIdFromWorker) => {
      if (chainIdFromWorker !== chainId) return

      fillStateFromDB(chainId)
    })
  }, [chainId, updateState, fillStateFromDB])

  return null
}
