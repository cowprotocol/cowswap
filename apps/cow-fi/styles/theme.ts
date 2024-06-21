import { themeMapper } from '@cowprotocol/ui'
import { THEME_MODE } from '@/components/Layout/const'

import './types'

export function getTheme() {
  return themeMapper(THEME_MODE)
}
