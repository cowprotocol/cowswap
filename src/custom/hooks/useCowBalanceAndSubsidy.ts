import { useMemo } from 'react'
import { BigNumber } from 'bignumber.js'

import { getDiscountFromBalance } from 'components/CowSubsidyModal/utils'
import { useVCowData } from 'state/claim/hooks'
import { COW_SUBSIDY_DATA } from 'components/CowSubsidyModal/constants'

const ZERO_BALANCE_SUBSIDY = { subsidy: { tier: 0, discount: COW_SUBSIDY_DATA[0][1] }, balance: undefined }

export default function useCowBalanceAndSubsidy() {
  const { total: balance } = useVCowData()

  return useMemo(() => {
    if (!balance) return ZERO_BALANCE_SUBSIDY

    const balanceBn = new BigNumber(balance.quotient.toString())
    return { subsidy: getDiscountFromBalance(balanceBn), balance }
  }, [balance])
}
