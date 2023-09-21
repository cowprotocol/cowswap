import { useMemo } from 'react'

import { useInterfaceMulticall } from '@cowprotocol/common-hooks'
import { BigNumber } from '@ethersproject/bignumber'

import { useSingleCallResult } from 'lib/hooks/multicall'

// gets the current timestamp from the blockchain
export default function useCurrentBlockTimestamp(): BigNumber | undefined {
  const multicall = useInterfaceMulticall()
  const resultStr: string | undefined = useSingleCallResult(
    multicall,
    'getCurrentBlockTimestamp'
  )?.result?.[0]?.toString()
  return useMemo(() => (typeof resultStr === 'string' ? BigNumber.from(resultStr) : undefined), [resultStr])
}
