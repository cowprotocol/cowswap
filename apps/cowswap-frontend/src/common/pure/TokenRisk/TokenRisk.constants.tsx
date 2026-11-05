import { ReactNode } from 'react'

import { Activity, AlertCircle, Droplet, Lock, PlusCircle, ShieldOff, Slash, TrendingDown, Users } from 'react-feather'

const ICON_SIZE = 16

/**
 * Elements rather than component references: a component read out of a map during render is a
 * component created during render, which React resets the state of on every pass.
 */
const RISK_ICONS: Record<string, ReactNode> = {
  FREEZE: <Lock size={ICON_SIZE} />,
  PERM_DEL: <ShieldOff size={ICON_SIZE} />,
  NO_SELL: <Slash size={ICON_SIZE} />,
  MINT: <PlusCircle size={ICON_SIZE} />,
  CONCENTRATED: <Users size={ICON_SIZE} />,
  LOW_LIQ: <Droplet size={ICON_SIZE} />,
  LOW_ORGANIC: <Activity size={ICON_SIZE} />,
  LOW_VOLUME: <TrendingDown size={ICON_SIZE} />,
}

const FALLBACK_RISK_ICON: ReactNode = <AlertCircle size={ICON_SIZE} />

export function getRiskIcon(code: string): ReactNode {
  return RISK_ICONS[code] ?? FALLBACK_RISK_ICON
}
