import { WAIT_AND_SAVE_HARDCODED_VOLUME_FEE_SAVED_FIAT } from './waitAndSaveOutcome.constants'

import type { WaitAndSaveOutcomeProps } from './WaitAndSaveOutcome.pure'

export const WAIT_AND_SAVE_WITH_COW_DEMO: Extract<WaitAndSaveOutcomeProps, { variant: 'withCow' }> = {
  variant: 'withCow',
  gainAmount: '48,213.0542',
  tokenSymbol: 'RAI',
}

export const WAIT_AND_SAVE_WITH_COW_LONG_SYMBOL_DEMO: Extract<WaitAndSaveOutcomeProps, { variant: 'withCow' }> = {
  variant: 'withCow',
  gainAmount: '14.6161',
  tokenSymbol: 'B-80BAL-20WETH',
}

export const WAIT_AND_SAVE_WITH_WAIVED_FEE_AND_COW_FIAT_DEMO: Extract<
  WaitAndSaveOutcomeProps,
  { variant: 'withWaivedFeeAndCow' }
> = {
  variant: 'withWaivedFeeAndCow',
  priceImprovement: '$4.50',
  priceImprovementTitle: '0.001234567890123456 WETH',
  totalSaved: '$4.80',
  totalSavedTitle: '0.001316871349464753 WETH',
  volumeFeeSaved: WAIT_AND_SAVE_HARDCODED_VOLUME_FEE_SAVED_FIAT,
  volumeFeeSavedTitle: '0.000082303459341297 WETH',
}

export const WAIT_AND_SAVE_WITH_WAIVED_FEE_AND_COW_TOKEN_DEMO: Extract<
  WaitAndSaveOutcomeProps,
  { variant: 'withWaivedFeeAndCow' }
> = {
  variant: 'withWaivedFeeAndCow',
  priceImprovement: '1.46 RAI',
  totalSaved: '1.46 RAI',
  volumeFeeSaved: WAIT_AND_SAVE_HARDCODED_VOLUME_FEE_SAVED_FIAT,
}

export const WAIT_AND_SAVE_WITH_WAIVED_FEE_AND_COW_LONG_SYMBOL_DEMO: Extract<
  WaitAndSaveOutcomeProps,
  { variant: 'withWaivedFeeAndCow' }
> = {
  variant: 'withWaivedFeeAndCow',
  priceImprovement: '14.6161 B-80BAL-20WETH',
  totalSaved: '14.6161 B-80BAL-20WETH',
  volumeFeeSaved: WAIT_AND_SAVE_HARDCODED_VOLUME_FEE_SAVED_FIAT,
}

export const WAIT_AND_SAVE_WITH_WAIVED_FEE_DEMO: Extract<WaitAndSaveOutcomeProps, { variant: 'withWaivedFee' }> = {
  variant: 'withWaivedFee',
  volumeFeeSavedFiat: WAIT_AND_SAVE_HARDCODED_VOLUME_FEE_SAVED_FIAT,
}

export const WAIT_AND_SAVE_WITH_WAIVED_FEE_LONG_SYMBOL_DEMO: Extract<
  WaitAndSaveOutcomeProps,
  { variant: 'withWaivedFee' }
> = {
  variant: 'withWaivedFee',
  volumeFeeSavedFiat: '14.6161 B-80BAL-20WETH',
}

export const WAIT_AND_SAVE_OUTCOME_DEMO = WAIT_AND_SAVE_WITH_COW_DEMO
