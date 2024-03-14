import { createContext } from 'react'

import { HookDappApi } from '@cowprotocol/types'

export const HookDappApiContext = createContext<HookDappApi | undefined>(undefined)
