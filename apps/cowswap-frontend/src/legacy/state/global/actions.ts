import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { createAction } from '@reduxjs/toolkit'

// fired once when the app reloads but before the app renders
// allows any updates to be applied to store data loaded from localStorage
// export const updateVersion = createAction('global/updateVersion')
// takes chainId prop to properly set up lists
export const updateVersion = createAction<{ chainId?: SupportedChainId }>('global/updateVersion')
