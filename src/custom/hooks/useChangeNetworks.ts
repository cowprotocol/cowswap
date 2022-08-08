import { useCallback, useEffect, useRef } from 'react'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { useActiveWeb3React } from 'hooks/web3'
import { switchToNetwork } from 'utils/switchToNetwork'
import { useModalOpen, useToggleModal } from 'state/application/hooks'
import { CHAIN_INFO } from 'constants/chainInfo'
import useParsedQueryString from 'hooks/useParsedQueryString'
import usePrevious from 'hooks/usePrevious'
import { addPopup, ApplicationModal } from 'state/application/reducer'
import { useAppDispatch } from 'state/hooks'
import { replaceURLParam } from 'utils/routes'
import { getChainNameFromId, getParsedChainId } from 'components/Header/NetworkSelector'
import { useHistory } from 'react-router-dom'

type ChangeNetworksParams = Pick<ReturnType<typeof useActiveWeb3React>, 'account' | 'chainId' | 'library'>
export type ChainSwitchCallbackOptions = { skipWalletToggle: boolean; skipToggle: boolean }

export default function useChangeNetworks({ account, chainId, library }: ChangeNetworksParams) {
  const parsedQs = useParsedQueryString()
  const { urlChain, urlChainId } = getParsedChainId(parsedQs)
  const prevChainId = usePrevious(chainId)
  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.NETWORK_SELECTOR)
  const toggle = useToggleModal(ApplicationModal.NETWORK_SELECTOR)
  useOnClickOutside(node, open ? toggle : undefined)

  const history = useHistory()

  const dispatch = useAppDispatch()

  const info = chainId ? CHAIN_INFO[chainId] : undefined

  const handleChainSwitch = useCallback(
    (targetChain: number, options: ChainSwitchCallbackOptions) => {
      if (!library?.provider) return

      switchToNetwork({ provider: library.provider, chainId: targetChain })
        .then(() => {
          // mod
          if (!options.skipToggle) {
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
            history.replace({
              search: replaceURLParam(history.location.search, 'chain', getChainNameFromId(chainId)),
            })
          }
          // mod
          if (!options.skipToggle) {
            toggle()
          }

          dispatch(addPopup({ content: { failedSwitchNetwork: targetChain }, key: `failed-network-switch` }))
        })
    },
    [chainId, dispatch, history, library, toggle]
  )

  useEffect(() => {
    if (!chainId || !prevChainId) return

    // when network change originates from wallet or dropdown selector, just update URL
    if (chainId !== prevChainId) {
      history.replace({ search: replaceURLParam(history.location.search, 'chain', getChainNameFromId(chainId)) })
      // otherwise assume network change originates from URL
      // } else if (urlChainId && urlChainId !== chainId) {
    } else if (urlChainId && urlChainId !== chainId) {
      // handleChainSwitch(urlChainId, true)
      handleChainSwitch(urlChainId, { skipToggle: true, skipWalletToggle: false }) // MOD
    }
  }, [chainId, handleChainSwitch, history, prevChainId, urlChainId])

  // set chain parameter on initial load if not there
  useEffect(() => {
    if (chainId && !urlChainId) {
      history.replace({ search: replaceURLParam(history.location.search, 'chain', getChainNameFromId(chainId)) })
    }
  }, [chainId, history, urlChainId, urlChain])
  return { chainId, library, node, open, toggle, info, handleChainSwitch }
}
