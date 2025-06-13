import { useAtom } from 'jotai'
import { useEffect, useMemo, useRef } from 'react'

import { useWeb3React } from '@web3-react/core'

import { useWalletInfo } from '../../api/hooks'
import { hwAccountIndexAtom } from '../../api/state'
import { getIsHardWareWallet } from '../utils/getIsHardWareWallet'
import { getWeb3ReactConnection } from '../utils/getWeb3ReactConnection'

const indexChanged = true

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function HwAccountIndexUpdater() {
  const [hwAccountIndex, setHwAccountIndex] = useAtom(hwAccountIndexAtom)
  const { chainId, account } = useWalletInfo()
  const { connector, isActive } = useWeb3React()
  const connectorRef = useRef(connector)

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
    if (account) return

    setHwAccountIndex(0)
  }, [setHwAccountIndex, account])

  return null
}
