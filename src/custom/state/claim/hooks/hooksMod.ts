// import JSBI from 'jsbi'
// import { CurrencyAmount, Token } from '@uniswap/sdk-core'
// import { TransactionResponse } from '@ethersproject/providers'
// import { useEffect, useState } from 'react'
// import { UNI } from 'constants/tokens'
// import { useActiveWeb3React } from 'hooks/web3'
// import { useMerkleDistributorContract } from 'hooks/useContract'
// import { calculateGasMargin } from 'utils/calculateGasMargin'
// import { useSingleCallResult } from 'state/multicall/hooks'
import { isAddress } from 'utils/index'
// import { useTransactionAdder } from 'state/enhancedTransactions/hooks'
import { CLAIMS_REPO, RepoClaims, UserClaims } from '.'
import { transformRepoClaimsToUserClaims } from 'state/claim/hooks/utils'
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
// let FETCH_CLAIM_MAPPING_PROMISE: Promise<ClaimAddressMapping> | null = null
function fetchClaimsMapping(): Promise<ClaimAddressMapping> {
  // return (
  //   FETCH_CLAIM_MAPPING_PROMISE ??
  //   (FETCH_CLAIM_MAPPING_PROMISE = fetch(`${CLAIMS_REPO}mapping.json`) // mod
  //     .then((res) => res.json())
  //     .catch((error) => {
  //       console.error('Failed to get claims mapping', error)
  //       FETCH_CLAIM_MAPPING_PROMISE = null
  //     }))
  // )
  return Promise.resolve({ '0x00059034c8759f5C89af6792Eb3cFa2CCd12f6f3': '0x01bE7C603f60ae4b69BeC96816DBAC548cd784E6' })
}

// const FETCH_CLAIM_FILE_PROMISES: { [startingAddress: string]: Promise<{ [address: string]: RepoClaims }> } = {} // mod
function fetchClaimsFile(key: string): Promise<{ [address: string]: RepoClaims }> {
  console.log(`fetching key`, key)
  // return (
  //   FETCH_CLAIM_FILE_PROMISES[key] ??
  //   (FETCH_CLAIM_FILE_PROMISES[key] = fetch(`${CLAIMS_REPO}${key}.json`) // mod
  //     .then((res) => res.json())
  //     .catch((error) => {
  //       console.error(`Failed to get claim file mapping for starting address ${key}`, error)
  //       delete FETCH_CLAIM_FILE_PROMISES[key]
  //     }))
  // )
  return Promise.resolve({
    '0x0010B775429d6C92333E363CBd6BF28dDF1A87E6': [
      {
        proof: [
          '0xdbbb620e67ead29bcf4a7946340a5742ad85d93431836ce351fc27d758618a77',
          '0x9db68d2f44528e21355fa50f2d86b365196dcaac6098b43f752da57948967133',
          '0x95668515eeb02f888ae1048b6b5f687565295d1a534248b5be2cf306c373d791',
          '0x21c8b0c6ec791a63f0727c6490fd0311f9c9951f2619f0cc1972719a6d2f57a9',
          '0x36467d0e58c7d14192421d66badc4d7cdeb551fda697c4de4e7cd1d67f6f4474',
          '0x67352be12b02acae43ce9b6f13dba2cc0505d733595d56ac874a4f8275c1d253',
          '0xf8100319095c2d8c4ac636cc87c94a8b4ae72fa0c26be8f527958c06824251a1',
          '0x0a4979f880c89b6cfdd84f55301848abd50cea3e72b2b2af64239a732dacd528',
          '0x08d3e353a1f0dcd57090ee82f383ff038fbc8dbdc1f4449bbfc6109d36002df5',
          '0x3cb9f6df35b5e10bdc267da14150d0e2478f1596cdee2715f65aa24afde81ce1',
          '0xf10f53b7c2fb9b64282a73abda6114589387bb229cfc27cb42ac66ddbb639d7b',
          '0x8db32f710938011f7a52f525fcda77096b5fb6df9a79615fffd2ffacb4eacd25',
          '0x3addacdc093b79ee814c396b4df81e4f67d2507638b201bf309531a1e1b46580',
          '0x1f84fcb9c266c85347319843efda7c3ddd98d5862064e084fa1dcf3b1c5a014a',
          '0x1c5834c15212ba6f0cd97e697b521b41acca40fc7a56d3496e80159ff84887ff',
        ],
        index: 3,
        type: 'Team',
        amount: '883000000000000000000',
      },
      {
        proof: [
          '0x92e08522c31525547c0ef58df43ca63743431e3278b2b6711665748f58504e4a',
          '0x70786e6b8fbfba57452644e6fe1ec01ecb0451e170a20e0a9792d1b12bb870e1',
          '0x1f74c6eccf115ec05d38dae6834ff6bc456487cafdd12ce9bea2cd565bb4ca32',
          '0xeabb061cb2475aff027b8920f8d895a16f2f7bd98e029f17d35cb241054534cb',
          '0x2209376ceda8b8ee47a49d1df42a2d1f8cb36be241a6a6612b728c1f9958b63b',
          '0xdd9d179c85a43dc0fc26b45fe1383ffc70d10c79680954a283038a83aefd5ced',
          '0xada556e1e0a4e5ad6b6081248bd9738c93e6ae2c2ab0733e87b9e514fd178c2b',
          '0x7bf4d659add47b5c6104c93eba0763df2993b3978fadc670259b00c9339236dd',
          '0x28ad99dbbab5ab6242c3dd44750ef7d70850f013f4f775df66a74523bb05e209',
          '0x2c92171ab88f4e4ed180c31dae32ea9776a06feb9212b745cd88b99f29e651d4',
          '0x83e113c2e7dda5ec1e4de305d8979969a2e53117767f95a520f91d2ab67ad58a',
          '0x9ff9f0773b0b1ee89f87d63f4db6f1025e4f1effe2b5333b47ea42130ab283cc',
          '0x6b8a0ed76f8d99a71b2aeb28ebc8a029f84affc531956f579e13fdf0dc5e29a6',
          '0x7b019fce542fcfd0d9b2d1a79ca54014d4c77d3db26adfb0f3b60816a0e8c2f8',
          '0x3fb9f3c87451effbb58340761f30e2d2057a0a2fb27eee5ec6af3362be0389f9',
        ],
        index: 4,
        type: 'Advisor',
        amount: '883000000000000000000',
      },
    ],
  })
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
        if (result[formatted]) return transformRepoClaimsToUserClaims(result[formatted]) // mod
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
// export function useUserClaimData(account: string | null | undefined): UserClaimData | null {
//   const { chainId } = useActiveWeb3React()
//
//   const [claimInfo, setClaimInfo] = useState<{ [account: string]: UserClaimData | null }>({})
//
//   useEffect(() => {
//     if (!account || chainId !== 1) return
//
//     fetchClaim(account)
//       .then((accountClaimInfo) =>
//         setClaimInfo((claimInfo) => {
//           return {
//             ...claimInfo,
//             [account]: accountClaimInfo,
//           }
//         })
//       )
//       .catch(() => {
//         setClaimInfo((claimInfo) => {
//           return {
//             ...claimInfo,
//             [account]: null,
//           }
//         })
//       })
//   }, [account, chainId])
//
//   return account && chainId === 1 ? claimInfo[account] : null
// }

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

// export function useClaimCallback(account: string | null | undefined): {
//   claimCallback: () => Promise<string>
// } {
//   // get claim data for this account
//   const { library, chainId } = useActiveWeb3React()
//   const claimData = useUserClaimData(account)
//
//   // used for popup summary
//   const unclaimedAmount: CurrencyAmount<Token> | undefined = useUserUnclaimedAmount(account)
//   const addTransaction = useTransactionAdder()
//   const distributorContract = useMerkleDistributorContract()
//
//   const claimCallback = async function () {
//     if (!claimData || !account || !library || !chainId || !distributorContract) return
//
//     const args = [claimData.index, account, claimData.amount, claimData.proof]
//
//     return distributorContract.estimateGas['claim'](...args, {}).then((estimatedGasLimit) => {
//       return distributorContract
//         .claim(...args, { value: null, gasLimit: calculateGasMargin(chainId, estimatedGasLimit) })
//         .then((response: TransactionResponse) => {
//           addTransaction(response, {
//             summary: `Claimed ${unclaimedAmount?.toSignificant(4)} UNI`,
//             claim: { recipient: account },
//           })
//           return response.hash
//         })
//     })
//   }
//
//   return { claimCallback }
// }
