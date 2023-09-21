import { useAtom } from 'jotai'
import { useEffect, useMemo, useRef } from 'react'

import { getIsHardWareWallet, getWeb3ReactConnection, hwAccountIndexAtom, useWalletInfo } from '@cowprotocol/wallet'
import { useWeb3React } from '@web3-react/core'

import { useAppSelector } from 'legacy/state/hooks'

const indexChanged = true

export function HwAccountIndexUpdater() {
  const [hwAccountIndex, setHwAccountIndex] = useAtom(hwAccountIndexAtom)
  const { chainId } = useWalletInfo()
  const { connector, isActive } = useWeb3React()
  const connectorRef = useRef(connector)
  const selectedWallet = useAppSelector((state) => state.user.selectedWallet)

  connectorRef.current = connector

  const connectionType = useMemo(() => {
    const connection = getWeb3ReactConnection(connector)

    return connection.type
  }, [connector])

  /**
   * Reactivate connector each time when account index is changed from HwAccountIndexSelector
   * A hardware wallet connector should take into account the second parameter (indexChanged = true) for activate() method
   */
  useEffect(() => {
    if (!isActive) return

    const isHardWare = getIsHardWareWallet(connectionType)

    if (!isHardWare) return

    console.debug('[Hardware wallet] account index changed', hwAccountIndex)
    connectorRef.current?.activate(chainId, indexChanged)
  }, [isActive, hwAccountIndex, connectionType, chainId])

  useEffect(() => {
    if (selectedWallet) return

    console.debug('[Hardware wallet] reset account index to 0')
    setHwAccountIndex(0)
  }, [setHwAccountIndex, selectedWallet])

  return null
}
