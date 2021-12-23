// import JSBI from 'jsbi'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { TransactionResponse } from '@ethersproject/providers'
// import { useEffect, useState } from 'react'
// import { UNI } from 'constants/tokens'
import { useActiveWeb3React } from 'hooks/web3'
import { useMerkleDistributorContract } from 'hooks/useContract'
import { calculateGasMargin } from 'utils/calculateGasMargin'
// import { useSingleCallResult } from 'state/multicall/hooks'
import { isAddress } from 'utils/index'
import { useTransactionAdder } from 'state/enhancedTransactions/hooks'
import { UserClaims, useUserUnclaimedAmount } from '.'
// import { useSingleCallResult } from '@src/state/multicall/hooks'
export { useUserClaimData } from '@src/state/claim/hooks'

// interface UserClaimData {
//   index: number
//   amount: string
//   proof: string[]
//   flags?: {
//     isSOCKS: boolean
//     isLP: boolean
//     isUser: boolean
//   }
// }

type LastAddress = string
type ClaimAddressMapping = { [firstAddress: string]: LastAddress }
let FETCH_CLAIM_MAPPING_PROMISE: Promise<ClaimAddressMapping> | null = null
function fetchClaimsMapping(): Promise<ClaimAddressMapping> {
  return (
    FETCH_CLAIM_MAPPING_PROMISE ??
    (FETCH_CLAIM_MAPPING_PROMISE = fetch(
      `https://raw.githubusercontent.com/gnosis/cow-mrkl-drop-data-chunks/final/chunks/mapping.json`
    )
      .then((res) => res.json())
      .catch((error) => {
        console.error('Failed to get claims mapping', error)
        FETCH_CLAIM_MAPPING_PROMISE = null
      }))
  )
}

const FETCH_CLAIM_FILE_PROMISES: { [startingAddress: string]: Promise<{ [address: string]: UserClaims }> } = {}
function fetchClaimsFile(key: string): Promise<{ [address: string]: UserClaims }> {
  return (
    FETCH_CLAIM_FILE_PROMISES[key] ??
    (FETCH_CLAIM_FILE_PROMISES[key] = fetch(
      `https://raw.githubusercontent.com/gnosis/cow-mrkl-drop-data-chunks/final/chunks/${key}.json`
    )
      .then((res) => res.json())
      .catch((error) => {
        console.error(`Failed to get claim file mapping for starting address ${key}`, error)
        delete FETCH_CLAIM_FILE_PROMISES[key]
      }))
  )
}

const FETCH_CLAIM_PROMISES: { [key: string]: Promise<UserClaims> } = {}

// returns the claim for the given address, or null if not valid
export function fetchClaims(account: string): Promise<UserClaims> {
  const formatted = isAddress(account)
  if (!formatted) return Promise.reject(new Error('Invalid address'))

  return (
    FETCH_CLAIM_PROMISES[account] ??
    (FETCH_CLAIM_PROMISES[account] = fetchClaimsMapping()
      .then((mapping) => {
        const sorted = Object.keys(mapping).sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))

        for (const startingAddress of sorted) {
          const lastAddress = mapping[startingAddress]
          if (startingAddress.toLowerCase() <= formatted.toLowerCase()) {
            if (formatted.toLowerCase() <= lastAddress.toLowerCase()) {
              return startingAddress
            }
          } else {
            throw new Error(`Claim for ${formatted} was not found in partial search`)
          }
        }
        throw new Error(`Claim for ${formatted} was not found after searching all mappings`)
      })
      .then(fetchClaimsFile)
      .then((result) => {
        if (result[formatted]) return result[formatted]
        throw new Error(`Claim for ${formatted} was not found in claim file!`)
      })
      .catch((error) => {
        console.debug('Claim fetch failed', error)
        throw error
      }))
  )
}

// parse distributorContract blob and detect if user has claim data
// null means we know it does not
export function useUserClaims(account: string | null | undefined): UserClaims | null {
  console.log('[useUserClaims] ', account)
  // real world mock claim data
  return [
    {
      proof: [
        '0x85bb2d293209f2ef10959e033b3d43c6d67058717f7b0a70568ca7d028b3592d',
        '0x045442670919da3b5ce18ccc62308d670555184af497be8907560ff83e96fbc9',
        '0x49535c52497395e0f14b85ebe0900de58f0809aca5d54de44b6e1ad4a00868b5',
        '0xb3c22776e4694752f3f4d70f4a83fa50457b3df2c383b36fa26043dde76474cc',
        '0x23b39cfa6ca6ae97ba67daa849e6497e0e89fbf997eabbd31fe8af7e54544967',
        '0x1e88526debfd1b5c3955fc6c3facdbda5a99ba2cb1144d6cb7f21075c4becdf4',
        '0x82c926e522b6eeca8139d31cfb200b1af4e4c02e0992d25125fe7ec8c8e15feb',
        '0xac5661c776a0808e457967488a00e26d4ccf3e50426fc83a143d9150ae4f058a',
      ],
      index: 138,
      type: 'Airdrop',
      amount: '3925000000000000000000',
    },
    {
      proof: [
        '0x9ee4da15b49ddee8590aba5a89c4f137c3574920df8a44a52e6b88e420d068c7',
        '0xbc4e08f8cbd18bdc713aa11f6cb5f5b3ea4d5ddccdaed57118d45899c83aa8ff',
        '0x47591e84986f34a393c100f30219f4ba72c941053a598a1091644f9ee2920065',
        '0x3cbbad2cfe9bdb3dd08d7f31edf23a0e7b33386d28ef5adeb3601289315e4a69',
        '0xa168e9a8fd611fc5a6b83d06677a0a9fee5cc1b554a5dc3f5ed2485463901447',
        '0xb27279799e2cfd94f9296ab300661ab7b938882420878f87b1fb0dc0d0d4ac35',
        '0x82c926e522b6eeca8139d31cfb200b1af4e4c02e0992d25125fe7ec8c8e15feb',
        '0xac5661c776a0808e457967488a00e26d4ccf3e50426fc83a143d9150ae4f058a',
      ],
      index: 139,
      type: 'GnoOption',
      amount: '3925000000000000000000',
    },
  ]

  // const { chainId } = useActiveWeb3React()
  // const [claimInfo, setClaimInfo] = useState<{ [account: string]: UserClaims | null }>({})

  // useEffect(() => {
  //   if (!account || chainId !== 1) return

  //   fetchClaims(account)
  //     .then((accountClaimInfo) =>
  //       setClaimInfo((claimInfo) => {
  //         return {
  //           ...claimInfo,
  //           [account]: accountClaimInfo,
  //         }
  //       })
  //     )
  //     .catch(() => {
  //       setClaimInfo((claimInfo) => {
  //         return {
  //           ...claimInfo,
  //           [account]: null,
  //         }
  //       })
  //     })
  // }, [account, chainId])

  // return account && chainId === 1 ? claimInfo[account] : null
}

// check if user is in blob and has not yet claimed UNI
// export function useUserHasAvailableClaim(account: string | null | undefined): boolean {
//   const userClaimData = useUserClaimData(account)
//   const distributorContract = useMerkleDistributorContract()
//   const isClaimedResult = useSingleCallResult(distributorContract, 'isClaimed', [userClaimData?.index])
//   // user is in blob and contract marks as unclaimed
//   return Boolean(userClaimData && !isClaimedResult.loading && isClaimedResult.result?.[0] === false)
// }

// export function useUserUnclaimedAmount(account: string | null | undefined): CurrencyAmount<Token> | undefined {
//   const { chainId } = useActiveWeb3React()
//   const userClaimData = useUserClaimData(account)
//   const canClaim = useUserHasAvailableClaim(account)
//
//   const uni = chainId ? UNI[chainId] : undefined
//   if (!uni) return undefined
//   if (!canClaim || !userClaimData) {
//     return CurrencyAmount.fromRawAmount(uni, JSBI.BigInt(0))
//   }
//   return CurrencyAmount.fromRawAmount(uni, JSBI.BigInt(userClaimData.amount))
// }

export function useClaimCallback(account: string | null | undefined): {
  claimCallback: () => Promise<string>
} {
  // get claim data for this account
  const { library, chainId } = useActiveWeb3React()
  const claimData = useUserClaims(account)

  // used for popup summary
  const unclaimedAmount: CurrencyAmount<Token> | undefined = useUserUnclaimedAmount(account)
  const addTransaction = useTransactionAdder()
  const distributorContract = useMerkleDistributorContract()

  const claimCallback = async function () {
    if (!claimData || !account || !library || !chainId || !distributorContract) return

    // const args = [claimData.index, account, claimData.amount, claimData.proof]

    // TODO: Reduce Claimings into a bunch of arrays with all the claimings
    // const args = claimData.reduce(...)
    const args: string[] = []

    return distributorContract.estimateGas['claim'](...args, {}).then((estimatedGasLimit) => {
      return distributorContract
        .claim(...args, { value: null, gasLimit: calculateGasMargin(chainId, estimatedGasLimit) })
        .then((response: TransactionResponse) => {
          addTransaction({
            hash: response.hash,
            summary: `Claimed ${unclaimedAmount?.toSignificant(4)} CoW`,
            claim: { recipient: account },
          })
          return response.hash
        })
    })
  }

  return { claimCallback }
}
