import { atom, useAtom } from 'jotai'
import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { ButtonPrimary, InlineBanner, Loader, BannerOrientation, UI, StatusColorVariant } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

import { useAllTransactions } from 'legacy/state/enhancedTransactions/hooks'

import { useExtensibleFallbackContext } from '../../hooks/useExtensibleFallbackContext'
import { useSetupFallbackHandler } from '../../hooks/useSetupFallbackHandler'
import { verifyExtensibleFallback } from '../../services/verifyExtensibleFallback'
import { updateFallbackHandlerVerificationAtom } from '../../state/fallbackHandlerVerificationAtom'

const Banner = styled(InlineBanner)`
  /* TODO: Make all these part of the InlineBanner props */
  position: relative;
  font-size: 15px;

  > span {
    gap: 20px;
  }

  > span > span {
    gap: 20px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(${UI.COLOR_PAPER});
    z-index: -1;
    border-radius: inherit;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: inherit;
    z-index: -1;
    border-radius: inherit;
  }
`

const ActionButton = styled(ButtonPrimary)`
  display: inline-block;
  width: 100%;
  font-size: 16px;
  padding: 16px 24px;
  min-height: auto;
`

const pendingTxHashAtom = atom<string | null>(null)

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function SetupFallbackHandlerWarning() {
  const [pendingTxHash, setPendingTxHash] = useAtom(pendingTxHashAtom)
  const [fbHandlerCheckInProgress, setFbHandlerCheckInProgress] = useState(false)
  const [isFbHandlerInitiallyChecked, setIsFbHandlerInitiallyChecked] = useState(false)

  const { account } = useWalletInfo()
  const setupFallbackHandler = useSetupFallbackHandler()
  const isTransactionPending = useIsTransactionPending(pendingTxHash)
  const prevIsTransactionPending = usePrevious(isTransactionPending)
  const txWasMined = prevIsTransactionPending === true && isTransactionPending === false

  const updateFallbackHandlerVerification = useSetAtom(updateFallbackHandlerVerificationAtom)

  const extensibleFallbackContext = useExtensibleFallbackContext()

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleUpdateClick = async () => {
    const txHash = await setupFallbackHandler()

    if (txHash) {
      setPendingTxHash(txHash)
    }
  }

  const checkFallbackHandler = useCallback(() => {
    if (!extensibleFallbackContext || !account) return Promise.resolve()

    setFbHandlerCheckInProgress(true)

    return verifyExtensibleFallback(extensibleFallbackContext)
      .then((result) => {
        updateFallbackHandlerVerification({ [account.toLowerCase()]: result })
      })
      .finally(() => {
        setFbHandlerCheckInProgress(false)
      })
  }, [extensibleFallbackContext, account, updateFallbackHandlerVerification])

  /**
   * Once the transaction is mined, we need to verify the fallback handler
   */
  useEffect(() => {
    if (!txWasMined) return

    setPendingTxHash(null)

    checkFallbackHandler()
  }, [txWasMined, setPendingTxHash, checkFallbackHandler])

  /**
   * Check the fallback handler once the component is mounted
   * This check is needed for the case when the first TWAP order with fallback handler setup is created
   */
  useEffect(() => {
    if (fbHandlerCheckInProgress) return

    const timeout = setTimeout(() => {
      checkFallbackHandler().finally(() => {
        setIsFbHandlerInitiallyChecked(true)
      })
    }, 500)

    return () => clearTimeout(timeout)
  }, [checkFallbackHandler, fbHandlerCheckInProgress])

  /**
   * Don't render the banner until the fallback handler is checked at least once
   */
  if (!isFbHandlerInitiallyChecked) return null

  return (
    <div>
      <Banner
        bannerType={StatusColorVariant.Danger}
        backDropBlur
        orientation={BannerOrientation.Vertical}
        iconSize={46}
        noWrapContent
        padding="20px"
      >
        <span>
          <p>
            Your Safe fallback handler was changed after TWAP orders were placed. All open TWAP orders are not getting
            created because of that. Please, update the fallback handler in order to make the orders work again.
          </p>
          <ActionButton disabled={isTransactionPending} onClick={handleUpdateClick}>
            {isTransactionPending ? <Loader /> : 'Update fallback handler'}
          </ActionButton>
        </span>
      </Banner>
    </div>
  )
}

function useIsTransactionPending(txHash: string | null): boolean {
  const allTransactions = useAllTransactions()

  if (!txHash) return false

  return Object.keys(allTransactions).some((hash) => {
    const tx = allTransactions[hash]

    if (!tx || tx.receipt || tx.replacementType || tx.errorMessage) return false

    return tx.hash === txHash
  })
}
