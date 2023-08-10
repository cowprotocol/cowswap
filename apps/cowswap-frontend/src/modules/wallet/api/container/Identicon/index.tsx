import React from 'react'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'

import jazzicon from '@metamask/jazzicon'

import useENSAvatar from 'legacy/hooks/useENSAvatar'

import { useWalletInfo } from 'modules/wallet'
import { Identicon as IdenticonPure } from 'modules/wallet/api/pure/Identicon'

export interface IdenticonProps {
  size?: number
  account?: string
}

export function Identicon({ account: customAccount, size = 16 }: IdenticonProps) {
  const { account: chainAccount } = useWalletInfo()
  const account = customAccount || chainAccount

  const { avatar } = useENSAvatar(account ?? undefined, false)
  const [fetchable, setFetchable] = useState(true)

  const icon = useMemo(() => account && jazzicon(size, parseInt(account.slice(2, 10), 16)), [size, account])
  const iconRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const current = iconRef.current
    if (icon) {
      current?.appendChild(icon)
      return () => {
        try {
          current?.removeChild(icon)
        } catch (e: any) {
          console.error('Avatar icon not found')
        }
      }
    }
    return
  }, [icon, iconRef])

  return (
    <IdenticonPure
      avatar={avatar}
      showAvatar={fetchable}
      size={size}
      onErrorFetchAvatar={() => setFetchable(false)}
      iconRef={iconRef}
    />
  )
}
