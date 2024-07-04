import { createContext } from 'react'

import { HookDappContext as HookDappContextType } from '@cowprotocol/types'

export const HookDappContext = createContext<HookDappContextType | undefined>(undefined)
