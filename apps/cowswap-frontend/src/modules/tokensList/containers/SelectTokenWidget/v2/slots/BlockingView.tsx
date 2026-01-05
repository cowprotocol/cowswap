/**
 * BlockingView Slot - Full-screen modals that take over the widget
 * (import token, import list, manage lists, LP page)
 *
 * This slot bridges to the existing BlockingView component and its hooks.
 */
import { ReactNode } from 'react'

import { BlockingView as LegacyBlockingView } from '../../components/BlockingViews'

export function BlockingView(): ReactNode {
  return <LegacyBlockingView />
}
