import { createAction } from '@reduxjs/toolkit'
import { SafeInfoResponse } from '@gnosis.pm/safe-service-client'

export const setSafeInfo = createAction<SafeInfoResponse | undefined>('gnosisSafe/safeInfo')
