'use client'

import type { ReactNode } from 'react'

import { useConnection } from 'wagmi'

import { useAppKit } from '@reown/appkit/react'

import styles from './ConnectButton.module.css'

import { shortenAddress } from '@/shared/lib/format'
import { ChevronDownIcon } from '@/shared/ui/icons'

export function ConnectButton(): ReactNode {
  const { open } = useAppKit()
  const { address, isConnected } = useConnection()

  if (!isConnected || !address) {
    return (
      <button className={styles.connect} type="button" onClick={() => open()}>
        Connect wallet
      </button>
    )
  }

  return (
    <button className={styles.account} type="button" onClick={() => open({ view: 'Account' })}>
      <span className={styles.avatar} aria-hidden="true" />
      {shortenAddress(address)}
      <ChevronDownIcon className={styles.chevron} />
    </button>
  )
}
