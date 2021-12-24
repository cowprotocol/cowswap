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
import { ClaimType, UserClaims } from '.'
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
        '0x03cc3df79d865ad3bfbdd54ec8ee6001f294655fe0018e660c0879c046d82133',
        '0xd044fdd7448e035e36a13a1b3edb2d7158624c6578a31517e8deefc2034c216b',
        '0x4531947895cb7cfc7d878e32288a73c04eaf63af8345d47283ba2cb8bac7e8c5',
        '0xf1376d3d11b33948440cf71bcfa63e69a9ca436ab3cef016b9da36f2a226d3e2',
        '0xa5ff51dde0385f442354e8d2582e81fd7d81f0a9b558ceea8e84136e6b88501c',
        '0xdc13f692869b72e45579e0ef7f5afe670ffeb5c2931f5b72cc50a19121c57f68',
        '0xbf454c5b68f2a3637a1221ce1e5834ce5725f9fcef7f932f81af24127e312d58',
        '0x0c85968537348d6281fb14be6b4528e77fce7adb1ac9a6fae52c83182f64d848',
        '0xdc838baad0c5b2844072e96cd5376ca337f80b42746b46a46121afcc0e39e0ee',
        '0x52aaac536243500f3d5aae091887032322773b40f7fa906d0043a5d74013a8c4',
        '0x57158a64c297f7a0ae2530774437f91667aab006e084f3214986dce3ca898474',
        '0xc1d3779a02affbc6b4885b248a636f9a3fd124d356e639347bb04129436133bd',
        '0xe0b4fbf77c444bada1498ecbee1431eb297d4fa9a6d04f1dcb19571c334b5dcb',
        '0x768e2f52bd7f4c8f1251620800bed30d14d13453dd2f0ced98eff0212d5e5288',
        '0x3fb9f3c87451effbb58340761f30e2d2057a0a2fb27eee5ec6af3362be0389f9',
      ],
      index: 1080,
      type: ClaimType.Airdrop,
      amount: '9289000000000000000000',
    },
    {
      proof: [
        '0xe4a4711613f6a6abecec56531200077f399303168c12c794e03a16c7141277c7',
        '0x6979fe9243a97222a78662106ec36e652a3b7a96e0306091b441316bb42ee49b',
        '0xd60dc85ed37acc5c5623b8ca637210b0c72c578016cbcfc14e0f611683a0ddc4',
        '0xf324c5e050526464fff42caa978e415c89dd354721af7312713ce762aa4e3cf9',
        '0x111b233c7994b3a246749f97af91788099685536865f43bba299db917624c30f',
        '0x5b3bc344c7c6891fb381fb7092f8ef800d58d83d476bcc10cb73ebee97057a6e',
        '0x4da4607803446d6145992c69291a9b838eb7fba7a3e47f0783fcf0c5b7ac9e27',
        '0x668da11ee65c87085886bdef9d629bcb8f0882e7b375bfe760da962a4d3483ef',
        '0xa6bbe6222c6e6c8214d5393eddec4f1e52c968923d5e76f8cea6a45cc30a9033',
        '0xa2eb0b6a9bd133c79177ae56ae0f4eb556750562091f659b63462e32464fc4ad',
        '0x631279a8a000a2182f0ac5fb7628af58abb740f43541390d3a1b9fc43c240c32',
        '0x8db32f710938011f7a52f525fcda77096b5fb6df9a79615fffd2ffacb4eacd25',
        '0x3addacdc093b79ee814c396b4df81e4f67d2507638b201bf309531a1e1b46580',
        '0x1f84fcb9c266c85347319843efda7c3ddd98d5862064e084fa1dcf3b1c5a014a',
        '0x1c5834c15212ba6f0cd97e697b521b41acca40fc7a56d3496e80159ff84887ff',
      ],
      index: 1081,
      type: ClaimType.GnoOption,
      amount: '9289000000000000000000',
    },
    {
      proof: [
        '0x903dad7e81712ab3858558a3ee083d2197c5ab345fc721143a78ac59b2fbe8a7',
        '0x4db9088b89dd41f82e2dc34ef47f64389970b50143251a39aa6fe19cdbd656cf',
        '0x03be42b4e6980a26ffaed8bebb9e4fe98f9d189baab81045fc3568b847af8080',
        '0xa0d55fee34a2b2869e64b66cfe63b6d3eb059020ebce7168558fb96938ad7ff2',
        '0x705b26f2b216f99a72e931b1f49161310b22fe21b4dcca40ccd6e63eacd70dc3',
        '0x631afde099857df0ccfd45bdba8445e4e0eaaa65a74d3be7db0a586787501f10',
        '0x30e698f66f132fd2115c5014f470e7525743f9110469e12dfddd6ea339dd8ccc',
        '0xb010642525d139c72ddb4fb874fc19e1b47a866a1976e6898e9d275d2e1b02a8',
        '0xdc8c8f45c7346752fe8fa3e3de0442541acb25ff22f2b1813596c75aeb9f3773',
        '0x2c92171ab88f4e4ed180c31dae32ea9776a06feb9212b745cd88b99f29e651d4',
        '0x83e113c2e7dda5ec1e4de305d8979969a2e53117767f95a520f91d2ab67ad58a',
        '0x9ff9f0773b0b1ee89f87d63f4db6f1025e4f1effe2b5333b47ea42130ab283cc',
        '0x6b8a0ed76f8d99a71b2aeb28ebc8a029f84affc531956f579e13fdf0dc5e29a6',
        '0x7b019fce542fcfd0d9b2d1a79ca54014d4c77d3db26adfb0f3b60816a0e8c2f8',
        '0x3fb9f3c87451effbb58340761f30e2d2057a0a2fb27eee5ec6af3362be0389f9',
      ],
      index: 1082,
      type: ClaimType.UserOption,
      amount: '9289000000000000000000',
    },
    {
      proof: [
        '0xac1003d4e9454ec2788204f57830cd442e07aa3c002e96989b4fa1b7ee8fb781',
        '0x5d45dbb618e7b8a6e44126d2b31340ec67fef86816adb520b936d496bc2f04da',
        '0x069cd55cc7423bf340c19a709779bfaefb73db23c9ca261f36a0695c5809c31f',
        '0x9c6d662636dbe17db437904e83710430b7c2f64e668296c01934a32cf7f6d2ad',
        '0x9f29f9989c5f2676b9a2ce9e709885db936244244f55a44fb6230c285735fb97',
        '0x35d790c7d61eed82fcbeec6228cbf588c53b0127459626d8d43d511f22c8f344',
        '0x3142c466c8041cea94c8a93c0856860e55101f932c0e302a63b48df4583fb365',
        '0x4eb852823a9f41e409dfc8b4629b7e3de310231fae62355eb76470cdb47ba50b',
        '0x35ebda602b28c0a3b6a1d8fe8eba1dbf1d2249430c1b4396d302418f8e8d93f2',
        '0x842e5e67e088a322daa9e8f25aa0c9492db9f3359ed5527a1d45fbe64c5547ac',
        '0x516f3d9a760004d3d55addc0408764c34cc380551f1cb75efc6801c70ea98c3d',
        '0x7bd1e90485acf6b605c462165bc99f821461475bf27aee3783c5bef12a2072ab',
        '0xa61b9a8b2e60faeeca7b2972e4278a2e56520cb0621499e8cf2d91d97c181cf1',
        '0x1f84fcb9c266c85347319843efda7c3ddd98d5862064e084fa1dcf3b1c5a014a',
        '0x1c5834c15212ba6f0cd97e697b521b41acca40fc7a56d3496e80159ff84887ff',
      ],
      index: 1083,
      type: ClaimType.Advisor,
      amount: '9289000000000000000000',
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
