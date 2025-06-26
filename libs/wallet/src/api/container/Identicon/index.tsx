import { useRef, useState, useEffect, useCallback, useMemo } from 'react'

import { useENSAvatar } from '@cowprotocol/ens'

import jazzicon from '@metamask/jazzicon'
import styled from 'styled-components/macro'

import { useWalletInfo } from '../../hooks'
import { Identicon as IdenticonPure } from '../../pure/Identicon'

const JazzIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`

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
  const { avatar } = useENSAvatar(account, false)
  const ref = useRef<HTMLDivElement>(null)

  // Pre-generate a random seed for Jazzicon in case the account is not available
  const defaultSeed = useRef(Math.floor(Math.random() * 1000000))

  const handleError = useCallback(() => {
    setFetchable(false)
    setAvatarError(true)
  }, [])

  const shouldShowJazzicon = useMemo(() => {
    return !avatar || !fetchable || avatarError
  }, [avatar, fetchable, avatarError])

  useEffect(() => {
    if (shouldShowJazzicon && ref.current) {
      // Clear the current contents of the div
      ref.current.innerHTML = ''
      // Generate a Jazzicon for the given account address
      const seed = account ? parseInt(account.slice(2, 10), 16) : defaultSeed.current
      const icon = jazzicon(size, seed)
      ref.current.appendChild(icon)
    }

    // When avatar is updated, reset the error state
    return () => {
      setAvatarError(false)
    }
  }, [shouldShowJazzicon, account, size, handleError])

  return shouldShowJazzicon ? (
    <JazzIconWrapper ref={ref} />
  ) : (
    <IdenticonPure avatar={avatar} size={size} showAvatar={fetchable} onErrorFetchAvatar={handleError} />
  )
}
