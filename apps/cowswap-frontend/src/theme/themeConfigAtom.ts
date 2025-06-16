import { atom } from 'jotai'

import { getCowswapTheme } from './getCowswapTheme'

export const themeConfigAtom = atom(getCowswapTheme(false))
