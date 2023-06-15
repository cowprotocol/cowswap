import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useCallback } from 'react'

import { NoImpactWarning } from 'modules/trade/pure/NoImpactWarning'
import { useIsSafeViaWc } from 'modules/wallet'

import { FallbackHandlerWarning } from './warnings/FallbackHandlerWarning'
import { UnsupportedWalletWarning } from './warnings/UnsupportedWalletWarning'

import { useFallbackHandlerVerification } from '../../hooks/useFallbackHandlerVerification'
import { useTwapWarningsContext } from '../../hooks/useTwapWarningsContext'
import { TwapFormState } from '../../pure/PrimaryActionButton/getTwapFormState'
import { ExtensibleFallbackVerification } from '../../services/verifyExtensibleFallback'
import { twapOrdersSettingsAtom, updateTwapOrdersSettingsAtom } from '../../state/twapOrdersSettingsAtom'

interface TwapFormWarningsProps {
  localFormValidation: TwapFormState | null
}

export function TwapFormWarnings({ localFormValidation }: TwapFormWarningsProps) {
  const { isFallbackHandlerSetupAccepted, isPriceImpactAccepted } = useAtomValue(twapOrdersSettingsAtom)
  const updateTwapOrdersSettings = useUpdateAtom(updateTwapOrdersSettingsAtom)

  const fallbackHandlerVerification = useFallbackHandlerVerification()
  const isSafeViaWc = useIsSafeViaWc()
  const { canTrade, showPriceImpactWarning, walletIsNotConnected } = useTwapWarningsContext()

  const toggleFallbackHandlerSetupFlag = useCallback(
    (isFallbackHandlerSetupAccepted: boolean) => {
      updateTwapOrdersSettings({ isFallbackHandlerSetupAccepted })
    },
    [updateTwapOrdersSettings]
  )

  const setIsPriceImpactAccepted = useCallback(() => {
    updateTwapOrdersSettings({ isPriceImpactAccepted: !isPriceImpactAccepted })
  }, [updateTwapOrdersSettings, isPriceImpactAccepted])

  // Don't display any warnings while a wallet is not connected
  if (walletIsNotConnected) return null

  return (
    <>
      {showPriceImpactWarning && (
        <NoImpactWarning
          withoutAccepting={false}
          isAccepted={isPriceImpactAccepted}
          acceptCallback={() => setIsPriceImpactAccepted()}
        />
      )}

      {(() => {
        if (localFormValidation === TwapFormState.NOT_SAFE) {
          return <UnsupportedWalletWarning isSafeViaWc={isSafeViaWc} />
        }

        if (canTrade && fallbackHandlerVerification !== ExtensibleFallbackVerification.HAS_DOMAIN_VERIFIER) {
          return (
            <FallbackHandlerWarning
              isFallbackHandlerSetupAccepted={isFallbackHandlerSetupAccepted}
              toggleFallbackHandlerSetupFlag={toggleFallbackHandlerSetupFlag}
            />
          )
        }

        return null
      })()}
    </>
  )
}
