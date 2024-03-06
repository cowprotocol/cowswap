import { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { validatePartnerFee } from './validatePartnerFee'

import { WidgetParamsErrors } from '../state/injectedWidgetParamsAtom'

type Keys = keyof CowSwapWidgetParams

const VALIDATIONS: Partial<{ [key in Keys]: (param: CowSwapWidgetParams[key]) => string[] | undefined }> = {
  partnerFee: validatePartnerFee,
}

export function validateWidgetParams(params: CowSwapWidgetParams): WidgetParamsErrors {
  const keys = Object.keys(params) as Keys[]

  return keys.reduce<WidgetParamsErrors>((acc, key) => {
    const validation = VALIDATIONS[key]

    if (!validation) return acc

    const errors = validation(params[key] as never)

    if (errors) {
      acc[key] = errors
    }

    return acc
  }, {})
}
