import { useMemo } from 'react'

import { uriToHttp } from '@cowprotocol/common-utils'

import { useEnsAvatar } from 'wagmi'

import { useENSName } from './useENSName'

import { normalize } from '../utils/normalize'

import type { Address } from 'viem'

/**
 * Returns the ENS avatar URI, if available.
 * Spec: https://gist.github.com/Arachnid/9db60bd75277969ee1689c8742b75182.
 */
export function useENSAvatar(account: Address | undefined): { avatar: string | null; loading: boolean } {
  const ENSName = useENSName(account).ENSName
  const response = useEnsAvatar({ name: normalize(ENSName) })

  const http = useMemo(() => response.data && uriToHttp(response.data)[0], [response.data])

  return useMemo(
    () => ({
      avatar: http ?? null,
      loading: response.isLoading,
    }),
    [http, response.isLoading],
  )
}
