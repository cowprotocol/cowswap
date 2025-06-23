import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { Routes } from 'common/constants/routes'

import { CoWShedWidgetTabs } from '../const'

export function getShedRouteLink(chainId: SupportedChainId, tab?: CoWShedWidgetTabs): string {
  return Routes.COW_SHED.replace('/:chainId?', chainId ? `/${encodeURIComponent(chainId)}` : '').replace(
    '/:tab?',
    tab ? `/${encodeURIComponent(tab)}` : '',
  )
}
