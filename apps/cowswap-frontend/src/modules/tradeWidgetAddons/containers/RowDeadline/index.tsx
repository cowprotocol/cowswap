import { useMemo } from 'react'

import { useIsEoaEthFlow, useIsWrapOrUnwrap } from 'modules/trade'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { RowDeadlineContent } from '../../pure/Row/RowDeadline'

export function RowDeadline({ deadline }: { deadline: number }) {
  const isEoaEthFlow = useIsEoaEthFlow()
  const nativeCurrency = useNativeCurrency()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()

  const props = useMemo(() => {
    const displayDeadline = Math.floor(deadline / 60) + ' minutes'
    return {
      userDeadline: deadline,
      symbols: [nativeCurrency.symbol],
      displayDeadline,
      isEoaEthFlow,
      isWrapOrUnwrap,
    }
  }, [isEoaEthFlow, isWrapOrUnwrap, nativeCurrency.symbol, deadline])

  if (!isEoaEthFlow || isWrapOrUnwrap) {
    return null
  }

  return <RowDeadlineContent {...props} />
}
