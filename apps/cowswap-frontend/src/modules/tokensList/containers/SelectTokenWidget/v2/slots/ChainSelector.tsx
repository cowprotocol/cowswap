/**
 * ChainSelector Slot - Mobile chain selection chip and panel
 *
 * This slot bridges to the existing ChainSelector component and its hooks.
 * For desktop, use NetworkPanel (rendered outside the modal container).
 */
import { ReactNode } from 'react'

import {
  ChainSelector as LegacyChainSelector,
  DesktopChainPanel as LegacyDesktopPanel,
} from '../../components/ChainSelector'

export function ChainSelector(): ReactNode {
  return <LegacyChainSelector />
}

export function DesktopChainPanel(): ReactNode {
  return <LegacyDesktopPanel />
}
