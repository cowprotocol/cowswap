import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { createAction } from '@reduxjs/toolkit'

import { GasFeeEndpointResponse } from 'api/gasPrices'

export type UpdateGasPrices = GasFeeEndpointResponse & { chainId?: SupportedChainId }

export const updateGasPrices = createAction<UpdateGasPrices>('gas/updateGasPrices')
