import React from 'react'
import { ManageLists as ManageListsMod } from './ManageListsMod'
import { DEFAULT_NETWORK_FOR_LISTS, UNSUPPORTED_LIST_URLS } from 'constants/lists'
import { useActiveWeb3React } from 'hooks/web3'
import { CurrencyModalView } from '@src/components/SearchModal/CurrencySearchModal'
import { TokenList } from '@uniswap/token-lists'
import { acceptListUpdate, removeList, disableList, enableList } from 'state/lists/actions'
import { supportedChainId } from 'utils/supportedChainId'

export interface ListRowProps {
  acceptListUpdate: (url: string) => ReturnType<typeof acceptListUpdate>
  removeList: (url: string) => ReturnType<typeof removeList>
  disableList: (url: string) => ReturnType<typeof disableList>
  enableList: (url: string) => ReturnType<typeof enableList>
}

export const ManageLists = (props: {
  setModalView: (view: CurrencyModalView) => void
  setImportList: (list: TokenList) => void
  setListUrl: (url: string) => void
}) => {
  const { chainId: connectedChainId } = useActiveWeb3React()
  const chainId = supportedChainId(connectedChainId) ?? DEFAULT_NETWORK_FOR_LISTS

  const listRowProps = {
    acceptListUpdate: (url: string) => acceptListUpdate({ url, chainId }),
    removeList: (url: string) => removeList({ url, chainId }),
    disableList: (url: string) => disableList({ url, chainId }),
    enableList: (url: string) => enableList({ url, chainId }),
  }
  return <ManageListsMod {...props} unsupportedListUrls={UNSUPPORTED_LIST_URLS[chainId]} listRowProps={listRowProps} />
}
