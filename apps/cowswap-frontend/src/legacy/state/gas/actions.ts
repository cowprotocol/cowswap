import { createAction } from '@reduxjs/toolkit'

import { GasFeeEndpointResponse } from 'api/gasPrices'

import { WithChainId } from '../lists/actions'

export type UpdateGasPrices = GasFeeEndpointResponse & WithChainId

export const updateGasPrices = createAction<UpdateGasPrices>('gas/updateGasPrices')
