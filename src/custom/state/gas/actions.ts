import { createAction } from '@reduxjs/toolkit'
import { WithChainId } from '../lists/actions'
import { GasFeeEndpointResponse } from '@cow/api/gnosisProtocol/api'

export type UpdateGasPrices = GasFeeEndpointResponse & WithChainId

export const updateGasPrices = createAction<UpdateGasPrices>('gas/updateGasPrices')
