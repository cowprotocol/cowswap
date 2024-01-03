import { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { isAnAddressAccount, isAnOrderId, isEns, isATxHash } from 'utils'
import { usePathPrefix } from 'state/network'
import { web3 } from 'apps/explorer/api'

export function pathAccordingTo(query: string): string {
  let path = 'search'
  if (isAnAddressAccount(query)) {
    path = 'address'
  } else if (isAnOrderId(query)) {
    path = 'orders'
  } else if (isATxHash(query)) {
    path = 'tx'
  }

  return path
}

export async function resolveENS(name: string): Promise<string | null> {
  if (!web3) return null

  try {
    const address = await web3.eth.ens.getAddress(name)
    return address && address.length > 0 ? address : null
  } catch (e) {
    console.error(`[web3:api] Could not resolve ${name} ENS. `, e)
    return null
  }
}

export function useSearchSubmit(): (query: string) => void {
  const history = useHistory()
  const prefixNetwork = usePathPrefix()

  return useCallback(
    (query: string) => {
      // For now assumes /orders/ path. Needs logic to try all types for a valid response:
      // Orders, transactions, tokens, batches
      const path = pathAccordingTo(query)
      const pathPrefix = prefixNetwork ? `${prefixNetwork}/${path}` : `${path}`

      if (path === 'address' && isEns(query)) {
        history.push(`/${path}/${query}`)
      } else {
        query && query.length > 0 && history.push(`/${pathPrefix}/${query}`)
      }
    },
    [history, prefixNetwork],
  )
}
