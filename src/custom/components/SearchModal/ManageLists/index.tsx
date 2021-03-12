import React from 'react'
import { ManageLists as ManageListsMod } from './ManageListsMod'
import { DEFAULT_NETWORK_FOR_LISTS, UNSUPPORTED_LIST_URLS } from 'constants/lists'
import { useActiveWeb3React } from '@src/hooks'
import { CurrencyModalView } from '@src/components/SearchModal/CurrencySearchModal'
import { TokenList } from '@uniswap/token-lists'

export const ManageLists = (props: {
  setModalView: (view: CurrencyModalView) => void
  setImportList: (list: TokenList) => void
  setListUrl: (url: string) => void
}) => {
  const { chainId = DEFAULT_NETWORK_FOR_LISTS } = useActiveWeb3React()
  return <ManageListsMod {...props} unsupportedListUrls={UNSUPPORTED_LIST_URLS[chainId]} />
}
