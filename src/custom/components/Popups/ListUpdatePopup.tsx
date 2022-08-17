import { useCallback } from 'react'
import ListUpdatePopupMod from './ListUpdatePopupMod'
import { TokenList } from '@uniswap/token-lists'
import { ListRowProps } from '../SearchModal/ManageLists'
import { acceptListUpdate } from 'state/lists/actions'
import { DEFAULT_NETWORK_FOR_LISTS } from 'constants/lists'
import { useWeb3React } from '@web3-react/core'

export interface ListUpdatePopupProps {
  popKey: string
  listUrl: string
  oldList: TokenList
  newList: TokenList
  auto: boolean
  // MOD: accept custom callback
  acceptListUpdate: ListRowProps['acceptListUpdate']
}

export default function ListUpdatePopup(props: Omit<ListUpdatePopupProps, 'acceptListUpdate'>) {
  const { chainId = DEFAULT_NETWORK_FOR_LISTS } = useWeb3React()
  const acceptListUpdateCustom = useCallback((url: string) => acceptListUpdate({ url, chainId }), [chainId])

  return <ListUpdatePopupMod {...props} acceptListUpdate={acceptListUpdateCustom} />
}
