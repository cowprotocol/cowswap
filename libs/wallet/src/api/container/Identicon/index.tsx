import { useState, useEffect } from 'react'

import { useENSAvatar } from '@cowprotocol/ens'

import { useWalletInfo } from '../../hooks'
import { Identicon as IdenticonPure } from '../../pure/Identicon'
import { JazzIcon } from '../../pure/JazzIcon'

export interface IdenticonProps {
  size?: number
  account?: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Identicon({ account: customAccount, size = 16 }: IdenticonProps) {
  const [avatarError, setAvatarError] = useState(false)
  const [fetchable, setFetchable] = useState(true)
  const { account: chainAccount } = useWalletInfo()
  const account = customAccount || chainAccount
  const { avatar } = useENSAvatar(account)

  const handleError = (): void => {
    setFetchable(false)
    setAvatarError(true)
  }

  const shouldShowJazzicon = !avatar || !fetchable || avatarError

  useEffect(() => {
    // When avatar is updated, reset the error state
    return () => {
      setAvatarError(false)
    }
  }, [shouldShowJazzicon, account, size])

  return shouldShowJazzicon ? (
    <JazzIcon account={account} size={size} />
  ) : (
    <IdenticonPure avatar={avatar} size={size} showAvatar={fetchable} onErrorFetchAvatar={handleError} />
  )
}
