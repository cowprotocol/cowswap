import { useMemo } from 'react'
import { BigNumber } from 'bignumber.js'
import { getDiscountFromBalance } from 'components/CowSubsidyModal/utils'
import { useCombinedBalance } from 'state/cowToken/hooks'
import { COW_SUBSIDY_DATA } from 'components/CowSubsidyModal/constants'
import { isSupportedChain } from 'utils/supportedChainId'
import { useWeb3React } from '@web3-react/core'

const ZERO_BALANCE_SUBSIDY = { subsidy: { tier: 0, discount: COW_SUBSIDY_DATA[0][1] }, balance: undefined }

export default function useCowBalanceAndSubsidy() {
  const { balance } = useCombinedBalance()
  const { chainId } = useWeb3React()

  return useMemo(() => {
    if (!isSupportedChain(chainId) || !balance || balance?.equalTo('0')) return ZERO_BALANCE_SUBSIDY

    const balanceBn = new BigNumber(balance.quotient.toString())

    return { subsidy: getDiscountFromBalance(balanceBn), balance }
  }, [balance, chainId])
}
