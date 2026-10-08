'use client'

import type { ReactNode } from 'react'

import { useConnection } from 'wagmi'

import { useAppKit } from '@reown/appkit/react'

import styles from './ConnectButton.module.css'

export function ConnectButton(): ReactNode {
  const { open } = useAppKit()
  const { address, isConnected } = useConnection()

  return (
    <button className={styles.button} type="button" onClick={() => open(isConnected ? { view: 'Account' } : undefined)}>
      {isConnected && address ? shortenAddress(address) : 'Connect wallet'}
    </button>
  )
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}
