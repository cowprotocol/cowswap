import { useMemo } from 'react'

import type { Address } from 'viem'
import { useEnsAvatar } from 'wagmi'

import { uriToHttp } from '@cowprotocol/common-utils'

import { useENSName } from './useENSName'

import { normalizeEnsName } from '../utils/normalize'

/**
 * Returns the ENS avatar URI, if available.
 * Spec: https://gist.github.com/Arachnid/9db60bd75277969ee1689c8742b75182.
 */
export function useENSAvatar(account: Address | undefined): { avatar: string | null; loading: boolean } {
  const ENSName = useENSName(account).ENSName
  const response = useEnsAvatar({ name: normalizeEnsName(ENSName) })

  const http = useMemo(() => response.data && uriToHttp(response.data)[0], [response.data])

  return useMemo(
    () => ({
      avatar: http ?? null,
      loading: response.isLoading,
    }),
    [http, response.isLoading],
  )
}
