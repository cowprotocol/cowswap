'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import type { ReactNode } from 'react'

import { createPortal } from 'react-dom'

import styles from './WalletBar.module.css'

import { walletBarSlotAtom } from '../model/walletBarSlotAtom'

import { ConnectButton } from '@/features/connect-wallet'

/** In px, for JS that measures against the bar. CSS reads `--wallet-bar-height` */
export const WALLET_BAR_HEIGHT = 56

export function WalletBar(): ReactNode {
  const setSlot = useSetAtom(walletBarSlotAtom)

  return (
    <div className={styles.bar}>
      <ConnectButton />
      <div ref={setSlot} className={styles.slot} />
    </div>
  )
}

/**
 * Renders `children` in the wallet bar, next to the wallet. The slot is an inline-size container, so `children` can
 * use container queries to fit the room the wallet leaves
 */
export function WalletBarSlot({ children }: { children: ReactNode }): ReactNode {
  const slot = useAtomValue(walletBarSlotAtom)

  return slot && createPortal(children, slot)
}
