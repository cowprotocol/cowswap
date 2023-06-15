import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useCallback } from 'react'

import { FallbackHandlerWarning } from './warnings/FallbackHandlerWarning'
import { UnsupportedWalletWarning } from './warnings/UnsupportedWalletWarning'

import { useIsSafeViaWc } from '../../../wallet'
import { NEED_FALLBACK_HANDLER_STATES, TwapFormState } from '../../pure/PrimaryActionButton/getTwapFormState'
import { twapOrdersSettingsAtom, updateTwapOrdersSettingsAtom } from '../../state/twapOrdersSettingsAtom'

interface TwapFormWarningsProps {
  localFormValidation: TwapFormState | null
  walletIsNotConnected: boolean
}

export function TwapFormWarnings({ localFormValidation, walletIsNotConnected }: TwapFormWarningsProps) {
  const { isFallbackHandlerSetupAccepted } = useAtomValue(twapOrdersSettingsAtom)
  const updateTwapOrdersSettings = useUpdateAtom(updateTwapOrdersSettingsAtom)
  const isSafeViaWc = useIsSafeViaWc()

  const toggleFallbackHandlerSetupFlag = useCallback(
    (isFallbackHandlerSetupAccepted: boolean) => {
      updateTwapOrdersSettings({ isFallbackHandlerSetupAccepted })
    },
    [updateTwapOrdersSettings]
  )

  // Don't display any warnings while a wallet is not connected
  if (walletIsNotConnected) return null

  if (localFormValidation === TwapFormState.NOT_SAFE) {
    return <UnsupportedWalletWarning isSafeViaWc={isSafeViaWc} />
  }

  if (localFormValidation && NEED_FALLBACK_HANDLER_STATES.includes(localFormValidation)) {
    return (
      <FallbackHandlerWarning
        isFallbackHandlerSetupAccepted={isFallbackHandlerSetupAccepted}
        toggleFallbackHandlerSetupFlag={toggleFallbackHandlerSetupFlag}
      />
    )
  }

  return null
}
