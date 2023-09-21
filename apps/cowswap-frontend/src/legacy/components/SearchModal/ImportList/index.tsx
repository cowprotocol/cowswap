import { useCallback } from 'react'

import { DEFAULT_NETWORK_FOR_LISTS } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'
import { TokenList } from '@uniswap/token-lists'

import { useDispatch } from 'react-redux'

import { CurrencyModalView } from 'legacy/components/SearchModal/CurrencySearchModal'
import { enableList as enableListMod, removeList as removeListMod } from 'legacy/state/lists/actions'

import { ImportList as ImportListMod } from './ImportListMod'

export interface ImportProps {
  listURL: string
  list: TokenList
  onDismiss: () => void
  setModalView: (view: CurrencyModalView) => void
  enableList?: (url: string) => ReturnType<typeof enableListMod>
  removeList?: (url: string) => ReturnType<typeof removeListMod>
}

export function ImportList(props: ImportProps) {
  const { chainId = DEFAULT_NETWORK_FOR_LISTS } = useWalletInfo()
  const dispatch = useDispatch()

  // wrap actions in dispatch and pass new 'chainId' prop here to avoid changing in children
  const enableList = useCallback((url: string) => dispatch(enableListMod({ url, chainId })), [chainId, dispatch])
  const removeList = useCallback((url: string) => dispatch(removeListMod({ url, chainId })), [chainId, dispatch])

  return <ImportListMod {...props} enableList={enableList} removeList={removeList} />
}
