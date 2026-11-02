'use client'

import type { ReactNode } from 'react'

import { useConnection } from 'wagmi'

import { useAppKit } from '@reown/appkit/react'

import styles from './ConnectButton.module.css'

import { shortenAddress } from '@/shared/lib/format'
import { ChevronDownIcon } from '@/shared/ui/icons'

interface ConnectButtonProps {
  /** `secondary` is the light button for a connect prompt in the page, beside the header's primary one */
  variant?: 'primary' | 'secondary'
}

export function ConnectButton({ variant = 'primary' }: ConnectButtonProps): ReactNode {
  const { open } = useAppKit()
  const { address, isConnected } = useConnection()

  if (!isConnected || !address) {
    return (
      <button className={`${styles.connect} ${styles[variant]}`} type="button" onClick={() => open()}>
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
