import { useCallback, useEffect, useRef } from 'react'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { useActiveWeb3React } from 'hooks/web3'
import { switchToNetwork } from 'utils/switchToNetwork'
import { useModalOpen, useToggleModal } from '../state/application/hooks'
import { CHAIN_INFO } from 'constants/chainInfo'
import useParsedQueryString from '@src/hooks/useParsedQueryString'
import usePrevious from '@src/hooks/usePrevious'
import { addPopup, ApplicationModal } from '@src/state/application/reducer'
import { useAppDispatch } from '@src/state/hooks'
import { replaceURLParam } from '@src/utils/routes'
import { getChainNameFromId, getParsedChainId } from 'components/Header/NetworkSelector'
import { useHistory } from 'react-router-dom'

type ChangeNetworksParams = Pick<ReturnType<typeof useActiveWeb3React>, 'chainId' | 'library'>

/**
 * Hook extracted from Header/NetworkSelector component pretty much verbatim
 *
 * @param chainId
 * @param library
 */
export default function useChangeNetworks({ chainId, library }: ChangeNetworksParams) {
  const parsedQs = useParsedQueryString()
  const { urlChain, urlChainId } = getParsedChainId(parsedQs)
  const prevChainId = usePrevious(chainId)
  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.NETWORK_SELECTOR)
  const toggle = useToggleModal(ApplicationModal.NETWORK_SELECTOR)
  useOnClickOutside(node, open ? toggle : undefined)

  const history = useHistory()

  const info = chainId ? CHAIN_INFO[chainId] : undefined

  const dispatch = useAppDispatch()

  const handleChainSwitch = useCallback(
    (targetChain: number, skipToggle?: boolean) => {
      if (!library) return
      switchToNetwork({ library, chainId: targetChain })
        .then(() => {
          if (!skipToggle) {
            toggle()
          }
          history.replace({
            search: replaceURLParam(history.location.search, 'chain', getChainNameFromId(targetChain)),
          })
        })
        .catch((error) => {
          console.error('Failed to switch networks', error)

          // we want app network <-> chainId param to be in sync, so if user changes the network by changing the URL
          // but the request fails, revert the URL back to current chainId
          if (chainId) {
            history.replace({ search: replaceURLParam(history.location.search, 'chain', getChainNameFromId(chainId)) })
          }

          if (!skipToggle) {
            toggle()
          }

          dispatch(addPopup({ content: { failedSwitchNetwork: targetChain }, key: `failed-network-switch` }))
        })
    },
    [dispatch, library, toggle, history, chainId]
  )

  useEffect(() => {
    if (!chainId || !prevChainId) return

    // when network change originates from wallet or dropdown selector, just update URL
    if (chainId !== prevChainId) {
      history.replace({ search: replaceURLParam(history.location.search, 'chain', getChainNameFromId(chainId)) })
      // otherwise assume network change originates from URL
    } else if (urlChainId && urlChainId !== chainId) {
      handleChainSwitch(urlChainId, true)
    }
  }, [chainId, urlChainId, prevChainId, handleChainSwitch, history])

  // set chain parameter on initial load if not there
  useEffect(() => {
    if (chainId && !urlChainId) {
      history.replace({ search: replaceURLParam(history.location.search, 'chain', getChainNameFromId(chainId)) })
    }
  }, [chainId, history, urlChainId, urlChain])
  return { chainId, library, node, open, toggle, info, handleChainSwitch }
}
