import { Erc20Abi, Erc20Interface } from '@cowprotocol/abis'
import { useAllTokens } from '@cowprotocol/tokens'
import { useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Interface } from '@ethersproject/abi'
import { useWalletInfo } from '@cowprotocol/wallet'
import { multicallTokens } from '../utils/multicallTokens'
import { GP_VAULT_RELAYER, TokenWithLogo } from '@cowprotocol/common-const'
import { useSetAtom } from 'jotai'
import { balancesAtom } from '../state/balancesAtom'
import { allowancesState } from '../state/allowancesAtom'

const erc20Interface = new Interface(Erc20Abi) as Erc20Interface

const zeroBn = BigInt(0)
// Some contracts return enormous values, so we need to limit the length of the returned string
const MAX_BALANCES_LENGTH = 128

const mapper = (value: string, token: TokenWithLogo) => {
  if (value.length > MAX_BALANCES_LENGTH) return zeroBn

  try {
    return BigInt(value)
  } catch (err) {
    return zeroBn
  }
}

export function BalancesAndAllowancesUpdater() {
  const { account, chainId } = useWalletInfo()
  const { provider } = useWeb3React()
  const allTokens = useAllTokens()

  const setBalances = useSetAtom(balancesAtom)
  const setAllowances = useSetAtom(allowancesState)

  const spender = GP_VAULT_RELAYER[chainId]

  useEffect(() => {
    if (!account || !provider) return

    const balanceCallData = erc20Interface.encodeFunctionData('balanceOf', [account])
    const allowanceCallData = erc20Interface.encodeFunctionData('allowance', [account, spender])

    setBalances((state) => ({ ...state, isLoading: true }))
    setAllowances((state) => ({ ...state, isLoading: true }))

    multicallTokens<bigint>({
      tokens: allTokens,
      callData: balanceCallData,
      provider,
      mapper,
    }).then((values) => {
      setBalances({ isLoading: false, values })
    })

    multicallTokens<bigint>({
      tokens: allTokens,
      callData: allowanceCallData,
      provider,
      mapper,
    }).then((values) => {
      setAllowances({ isLoading: false, values })
    })
  }, [provider, account, allTokens, spender, setBalances, setAllowances])

  return null
}
