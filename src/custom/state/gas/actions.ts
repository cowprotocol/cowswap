import { createAction } from '@reduxjs/toolkit'
import { WithChainId } from '../lists/actions'
import { GasFeeEndpointResponse } from '@cow/api/gasPrices'

export type UpdateGasPrices = GasFeeEndpointResponse & WithChainId

export const updateGasPrices = createAction<UpdateGasPrices>('gas/updateGasPrices')
