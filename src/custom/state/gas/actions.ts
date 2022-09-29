import { createAction } from '@reduxjs/toolkit'
import { WithChainId } from '../lists/actions'
import { GasFeeEndpointResponse } from 'cow-react/api/gnosisProtocol/api'

export type UpdateGasPrices = GasFeeEndpointResponse & WithChainId

export const updateGasPrices = createAction<UpdateGasPrices>('gas/updateGasPrices')
