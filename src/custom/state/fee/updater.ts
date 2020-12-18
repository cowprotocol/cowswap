import { useEffect } from 'react'
import { ChainId } from '@uniswap/sdk'
import { useActiveWeb3React } from 'hooks'
import { useAddFee, useAllFees } from './hooks'
import { useSwapState } from 'state/swap/hooks'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { FeesMap } from './reducer'
import { getFeeQuote } from 'utils/operator'

function isDateLater(dateA: string, dateB: string): boolean {
  const [parsedDateA, parsedDateB] = [Date.parse(dateA), Date.parse(dateB)]

  return parsedDateA > parsedDateB
}

export default function FeesUpdater(): null {
  const { chainId } = useActiveWeb3React()
  const {
    INPUT: { currencyId }
  } = useSwapState()
  const stateFeesMap = useAllFees({ chainId })
  const addFee = useAddFee()

  const windowVisible = useIsWindowVisible()

  const now = new Date().toISOString()

  useEffect(() => {
    if (!stateFeesMap || !chainId || !currencyId || !windowVisible) return

    async function runFeeHook({
      feesMap,
      chainId,
      sellToken
    }: {
      feesMap: Partial<FeesMap>
      chainId: ChainId
      sellToken: string
    }) {
      const currentFee = feesMap[sellToken]?.fee
      const isFeeDateValid = currentFee && isDateLater(currentFee.expirationDate, now)

      if (!isFeeDateValid || !currentFee) {
        const fee = await getFeeQuote(chainId, sellToken).catch(err => {
          console.error(new Error(err))
          return null
        })

        fee &&
          addFee({
            token: sellToken,
            fee,
            chainId
          })
      }
    }

    runFeeHook({ feesMap: stateFeesMap, sellToken: currencyId, chainId })
  }, [windowVisible, currencyId, chainId, now, addFee, stateFeesMap])

  return null
}
