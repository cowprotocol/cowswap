import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { useActiveWeb3React } from 'hooks/web3'
import { useAppSelector } from 'state/hooks'
import { CHAIN_INFO, SupportedChainId } from 'constants/chains'
import { switchToNetwork } from 'utils/switchToNetwork'
import { supportedChainId } from 'utils/supportedChainId'
import { useWalletModalToggle } from '../state/application/hooks'

type ChangeNetworksParams = Pick<ReturnType<typeof useActiveWeb3React>, 'account' | 'chainId' | 'library'>

export default function useChangeNetworks({ account, chainId: preChainId, library }: ChangeNetworksParams) {
  const { error } = useWeb3React() // MOD: check unsupported network
  const nodeRef = useRef<HTMLDivElement>()

  const [localOpen, setLocalOpen] = useState(false)
  const isModalOpen = localOpen

  const toggleWalletModal = useWalletModalToggle()
  const closeModal = useCallback(() => setLocalOpen(false), [])
  const openModal = useCallback(() => setLocalOpen(true), [])
  const toggleModal = useCallback(() => {
    if (isModalOpen) {
      closeModal()
    } else {
      openModal()
    }
  }, [closeModal, isModalOpen, openModal])

  useOnClickOutside(nodeRef, isModalOpen ? closeModal : undefined)

  const implements3085 = useAppSelector((state) => state.application.implements3085)

  // MOD: get supported chain and check unsupported
  const [chainId, isUnsupportedChain] = useMemo(() => {
    const chainId = supportedChainId(preChainId)

    return [chainId, error instanceof UnsupportedChainIdError] // Mod - return if chainId is unsupported
  }, [preChainId, error])

  const info = chainId ? CHAIN_INFO[chainId] : undefined

  const showSelector = Boolean(!account || implements3085)
  const mainnetInfo = CHAIN_INFO[SupportedChainId.MAINNET]

  const conditionalToggle = useCallback(() => {
    if (showSelector) {
      toggleModal()
    }
  }, [showSelector, toggleModal])

  // MOD: checks if a requested network switch was sent
  // used for when user disconnected and selects a network internally
  // if 3085 supported, will connect wallet and change network
  const [queuedNetworkSwitch, setQueuedNetworkSwitch] = useState<null | number>(null)

  const networkCallback = useCallback(
    (supportedChainId) => {
      if (!account) {
        toggleWalletModal()
        return setQueuedNetworkSwitch(supportedChainId)
      } else if (implements3085 && library && supportedChainId) {
        switchToNetwork({ library, chainId: supportedChainId })

        return isModalOpen && closeModal()
      }

      return
    },
    [account, implements3085, library, toggleWalletModal, isModalOpen, closeModal]
  )

  // if wallet supports 3085
  useEffect(() => {
    if (queuedNetworkSwitch && account && chainId && implements3085) {
      networkCallback(queuedNetworkSwitch)
      setQueuedNetworkSwitch(null)
    }
  }, [networkCallback, queuedNetworkSwitch, chainId, account, implements3085])

  return {
    callback: networkCallback,
    conditionalToggle,
    openModal,
    closeModal,
    isModalOpen,
    isUnsupportedChain,
    chainInfo: info,
    mainnetInfo,
    showSelector,
    nodeRef,
  }
}
