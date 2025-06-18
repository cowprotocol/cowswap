import { useSetAtom } from 'jotai/index'
import { useEffect } from 'react'

import { TokenInfo } from '@cowprotocol/types'

import { virtualListsStateAtom } from '../../state/tokenLists/tokenListsStateAtom'
import { ListState } from '../../types'


const VIRTUAL_LIST_SOURCE = 'widgetCustomTokens'
const VIRTUAL_LIST_NAME = 'Widget custom tokens'

export interface WidgetVirtualListUpdaterProps {
  customTokens?: TokenInfo[]
  appCode?: string
}

/**
 * The updater converts custom tokens provided by widget integrator to a virtual list
 * This list will be used by CoW Swap as a regular list, but it will not be displayed in the token lists settings
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function WidgetVirtualListUpdater({ customTokens, appCode }: WidgetVirtualListUpdaterProps) {
  const setVirtualListsState = useSetAtom(virtualListsStateAtom)

  useEffect(() => {
    if (!customTokens?.length) return

    const list: ListState = {
      source: VIRTUAL_LIST_SOURCE,
      isEnabled: true,
      widgetAppCode: appCode,
      list: {
        name: VIRTUAL_LIST_NAME,
        tokens: customTokens.map((token) => ({
          chainId: token.chainId,
          address: token.address,
          name: token.name,
          symbol: token.symbol,
          decimals: token.decimals,
          logoURI: token.logoURI,
        })),
        version: { major: 0, minor: 0, patch: 0 },
        timestamp: new Date().toISOString(),
      },
    }

    setVirtualListsState((prev) => ({ ...prev, [VIRTUAL_LIST_SOURCE]: list }))
  }, [customTokens, setVirtualListsState, appCode])

  return null
}
