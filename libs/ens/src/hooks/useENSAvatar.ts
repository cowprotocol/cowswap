import { useEffect, useMemo, useState } from 'react'

import { Erc1155, Erc1155Abi, Erc721, Erc721Abi } from '@cowprotocol/abis'
import { safeNamehash, uriToHttp, isAddress, isZero, getContract } from '@cowprotocol/common-utils'
import { BigNumber } from '@ethersproject/bignumber'
import { hexZeroPad } from '@ethersproject/bytes'
import { namehash } from '@ethersproject/hash'
import { useWeb3React } from '@web3-react/core'

import useSWR from 'swr'

import { useENSName } from './useENSName'
import { useENSResolver } from './useENSResolver'
import { useENSResolverContract } from './useENSResolverContract'


/**
 * Returns the ENS avatar URI, if available.
 * Spec: https://gist.github.com/Arachnid/9db60bd75277969ee1689c8742b75182.
 */
export function useENSAvatar(
  account: string | undefined,
  enforceOwnership = true
): { avatar: string | null; loading: boolean } {
  const node = useMemo(() => {
    if (!account || !isAddress(account)) return undefined
    return namehash(`${account.toLowerCase().substr(2)}.addr.reverse`)
  }, [account])

  const addressAvatar = useAvatarFromNode(node)
  const ENSName = useENSName(account).ENSName
  const nameAvatar = useAvatarFromNode(ENSName === null ? undefined : safeNamehash(ENSName))
  let avatar = addressAvatar.avatar || nameAvatar.avatar

  const nftAvatar = useAvatarFromNFT(account, avatar, enforceOwnership)
  avatar = nftAvatar.avatar || avatar

  const http = avatar && uriToHttp(avatar)[0]

  return useMemo(
    () => ({
      avatar: http ?? null,
      loading: addressAvatar.loading || nameAvatar.loading || nftAvatar.loading,
    }),
    [addressAvatar.loading, http, nameAvatar.loading, nftAvatar.loading]
  )
}

function useAvatarFromNode(node?: string): { avatar?: string; loading: boolean } {
  const { data: resolverAddress } = useENSResolver(node)

  const resolverContract = useENSResolverContract(
    resolverAddress && !isZero(resolverAddress) ? resolverAddress : undefined
  )

  const { data: avatar, isLoading } = useSWR(['useAvatarFromNode', node], async () => {
    if (!resolverContract || !node) return undefined

    return resolverContract.callStatic.text(node, 'avatar')
  })

  return useMemo(
    () => ({
      avatar: avatar,
      loading: isLoading,
    }),
    [avatar, isLoading]
  )
}

function useAvatarFromNFT(
  account: string | undefined,
  nftUri = '',
  enforceOwnership: boolean
): { avatar?: string; loading: boolean } {
  const parts = nftUri.toLowerCase().split(':')
  const protocol = parts[0]
  // ignore the chain from eip155
  // TODO: when we are able, pull only from the specified chain
  const [, erc] = parts[1]?.split('/') ?? []
  const [contractAddress, id] = parts[2]?.split('/') ?? []
  const isERC721 = protocol === 'eip155' && erc === 'erc721'
  const isERC1155 = protocol === 'eip155' && erc === 'erc1155'
  const erc721 = useERC721Uri(account, isERC721 ? contractAddress : undefined, id, enforceOwnership)
  const erc1155 = useERC1155Uri(account, isERC1155 ? contractAddress : undefined, id, enforceOwnership)
  const uri = erc721.uri || erc1155.uri
  const http = uri && uriToHttp(uri)[0]

  const [loading, setLoading] = useState(false)
  const [avatar, setAvatar] = useState(undefined)
  useEffect(() => {
    setAvatar(undefined)
    if (http) {
      setLoading(true)
      fetch(http)
        .then((res) => res.json())
        .then(({ image }) => {
          setAvatar(image)
        })
        .catch((e) => console.warn(e))
        .finally(() => {
          setLoading(false)
        })
    }
  }, [http])

  return useMemo(
    () => ({ avatar, loading: erc721.loading || erc1155.loading || loading }),
    [avatar, erc1155.loading, erc721.loading, loading]
  )
}

function useERC721Uri(
  account: string | undefined,
  contractAddress: string | undefined,
  id: string | undefined,
  enforceOwnership: boolean
): { uri?: string; loading: boolean } {
  const contract = useERC721Contract(contractAddress)

  const { data, isLoading } = useSWR(['useERC721Uri', contract, id], async () => {
    if (!contract || !account || !id) return undefined

    const [owner, uri] = await Promise.all([contract.callStatic.ownerOf(id), contract.callStatic.tokenURI(id)])

    return { owner, uri }
  })

  return useMemo(
    () => ({
      uri: !enforceOwnership || account === data?.owner ? data?.uri : undefined,
      loading: isLoading,
    }),
    [account, enforceOwnership, data, isLoading]
  )
}

function useERC1155Uri(
  account: string | undefined,
  contractAddress: string | undefined,
  id: string | undefined,
  enforceOwnership: boolean
): { uri?: string; loading: boolean } {
  const contract = useERC1155Contract(contractAddress)

  const { data, isLoading } = useSWR(['useERC1155Uri', contract, id, account], async () => {
    if (!contract || !account || !id) return undefined

    const [balance, uri] = await Promise.all([contract.callStatic.balanceOf(account, id), contract.callStatic.uri(id)])

    return { balance, uri }
  })

  // ERC-1155 allows a generic {id} in the URL, so prepare to replace if relevant,
  //   in lowercase hexadecimal (with no 0x prefix) and leading zero padded to 64 hex characters.
  const idHex = getIdHex(id) || ''

  return useMemo(() => {
    return {
      uri:
        (!enforceOwnership || data?.balance?.gt(0) ? (data?.uri || '').replace(/{id}/g, idHex) : undefined) ||
        undefined,
      loading: isLoading,
    }
  }, [enforceOwnership, idHex, data, isLoading])
}

function useERC721Contract(address: string | undefined): Erc721 | undefined {
  const { provider, chainId } = useWeb3React()

  const { data } = useSWR(['useERC721Contract', provider, chainId, address], () => {
    if (!chainId || !provider || !address) return undefined

    return getContract(address, Erc721Abi, provider) as Erc721
  })

  return data
}

function useERC1155Contract(address: string | undefined): Erc1155 | undefined {
  const { provider, chainId } = useWeb3React()

  const { data } = useSWR(['useERC1155Contract', provider, chainId, address], () => {
    if (!chainId || !provider || !address) return undefined

    return getContract(address, Erc1155Abi, provider) as Erc1155
  })

  return data
}

function getIdHex(id: string | undefined): string | undefined {
  try {
    return id ? hexZeroPad(BigNumber.from(id).toHexString(), 32).substring(2) : id
  } catch (e) {
    console.log(`Couldn't get id hex from id: ${id}`, e)

    return undefined
  }
}
