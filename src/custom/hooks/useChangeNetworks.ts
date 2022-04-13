import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { useActiveWeb3React } from 'hooks/web3'
import { switchToNetwork } from 'utils/switchToNetwork'
import { useModalOpen, useToggleModal, useWalletModalToggle } from 'state/application/hooks'
import { CHAIN_INFO } from 'constants/chainInfo'
import useParsedQueryString from 'hooks/useParsedQueryString'
import usePrevious from 'hooks/usePrevious'
import { addPopup, ApplicationModal } from 'state/application/reducer'
import { useAppDispatch } from 'state/hooks'
import { replaceURLParam } from 'utils/routes'
import { getChainNameFromId, getParsedChainId } from 'components/Header/NetworkSelector'
import { useHistory } from 'react-router-dom'
import { supportedChainId } from 'utils/supportedChainId'

type ChangeNetworksParams = Pick<ReturnType<typeof useActiveWeb3React>, 'account' | 'chainId' | 'library'>
export type ChainSwitchCallbackOptions = { skipWalletToggle: boolean; skipToggle: boolean }

/**
 * Hook extracted from Header/NetworkSelector component pretty much verbatim
 *
 * @param chainId
 * @param library
 */
export default function useChangeNetworks({ account, chainId: preChainId, library }: ChangeNetworksParams) {
  const parsedQs = useParsedQueryString()
  const { urlChain, urlChainId } = getParsedChainId(parsedQs)
  const prevChainId = usePrevious(preChainId)
  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.NETWORK_SELECTOR)
  const toggle = useToggleModal(ApplicationModal.NETWORK_SELECTOR)
  useOnClickOutside(node, open ? toggle : undefined)

  const history = useHistory()

  const dispatch = useAppDispatch()

  const toggleWalletModal = useWalletModalToggle() // MOD
  const [queuedNetworkSwitch, setQueuedNetworkSwitch] = useState<null | number>(null) // MOD
  // MOD: get supported chain and check unsupported
  const chainId = useMemo(() => {
    const chainId = supportedChainId(preChainId)

    return chainId
  }, [preChainId])

  const info = chainId ? CHAIN_INFO[chainId] : undefined

  const handleChainSwitch = useCallback(
    (targetChain: number, options: ChainSwitchCallbackOptions) => {
      if (!library) return
      // mod
      if (!account && !options.skipWalletToggle) {
        toggleWalletModal()
        return setQueuedNetworkSwitch(targetChain)
      } else {
        switchToNetwork({ library, chainId: targetChain })
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
      }
    },
    [dispatch, library, toggle, history, chainId, account, toggleWalletModal]
  )

  // MOD
  // handle the network switch on queued detection
  useEffect(() => {
    if (queuedNetworkSwitch && account && chainId) {
      handleChainSwitch(queuedNetworkSwitch, { skipToggle: true, skipWalletToggle: false })
      setQueuedNetworkSwitch(null)
    }
  }, [queuedNetworkSwitch, chainId, account, handleChainSwitch])

  useEffect(() => {
    if (!chainId || !prevChainId) return

    // when network change originates from wallet or dropdown selector, just update URL
    if (chainId !== prevChainId) {
      history.replace({ search: replaceURLParam(history.location.search, 'chain', getChainNameFromId(chainId)) })
      // otherwise assume network change originates from URL
      // } else if (urlChainId && urlChainId !== chainId) {
    } else if (!queuedNetworkSwitch && urlChainId && urlChainId !== chainId) {
      // handleChainSwitch(urlChainId, true)
      handleChainSwitch(urlChainId, { skipToggle: true, skipWalletToggle: false }) // MOD
    }
  }, [chainId, urlChainId, prevChainId, handleChainSwitch, history, queuedNetworkSwitch, urlChain])

  // set chain parameter on initial load if not there
  useEffect(() => {
    if (chainId && !urlChainId) {
      history.replace({ search: replaceURLParam(history.location.search, 'chain', getChainNameFromId(chainId)) })
    }
  }, [chainId, history, urlChainId, urlChain])
  return { chainId, library, node, open, toggle, info, handleChainSwitch }
}
