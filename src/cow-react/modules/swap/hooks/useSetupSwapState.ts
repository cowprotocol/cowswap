import { useWeb3React } from '@web3-react/core'
import { useAppDispatch } from 'state/hooks'
import { useEffect, useMemo } from 'react'
import { initSwapStateFromUrl } from 'cow-react/modules/swap/helpers/initSwapStateFromUrl'
import { replaceSwapState } from 'state/swap/actions'
import { useTradeStateFromUrl } from 'cow-react/modules/swap/hooks/useTradeStateFromUrl'
import { useSwapState } from 'state/swap/hooks'
import usePrevious from 'hooks/usePrevious'

/**
 * The state is populated in a cascade:
 * 1. Try setting swap state from URL
 * 2. Try setting swap state from Redux cache (localStorage)
 * 3. Fill swap state by default values
 *
 * Also, swap state updates on every location.search changes
 */
export function useSetupSwapState() {
  const { chainId, account } = useWeb3React()
  const previousAccount = usePrevious(account)
  const dispatch = useAppDispatch()
  const tradeStateFromUrl = useTradeStateFromUrl()
  const swapState = useSwapState()
  const wasAccountChanged = previousAccount && account && previousAccount !== account
  // Updated persisted state only when network or account changed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const persistedSwapState = useMemo(() => swapState, [chainId, wasAccountChanged])

  useEffect(() => {
    if (!chainId) return

    const isPersistedStateValid = persistedSwapState && persistedSwapState.chainId === chainId
    const shouldUsePersistedState = isPersistedStateValid && !wasAccountChanged

    const swapState = initSwapStateFromUrl(
      chainId,
      tradeStateFromUrl,
      shouldUsePersistedState ? persistedSwapState : null
    )

    console.debug('Set swap state from url: ', { chainId, swapState, shouldUsePersistedState })
    dispatch(replaceSwapState(swapState))
  }, [dispatch, tradeStateFromUrl, persistedSwapState, chainId, wasAccountChanged])
}
