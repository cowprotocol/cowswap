import { useEffect, useMemo, useState } from 'react'

import { useDebounce, useERC1155Contract, useERC721Contract } from '@cowswap/common-hooks'
import { safeNamehash, uriToHttp, isAddress, isZero } from '@cowswap/common-utils'
import { useWalletInfo } from '@cowswap/wallet'
import { BigNumber } from '@ethersproject/bignumber'
import { hexZeroPad } from '@ethersproject/bytes'
import { namehash } from '@ethersproject/hash'

import { useENSName } from './useENSName'
import { useENSResolverContract } from './useENSResolverContract'
import useSWR from 'swr'
import { useENSResolver } from './useENSResolver'

/**
 * Returns the ENS avatar URI, if available.
 * Spec: https://gist.github.com/Arachnid/9db60bd75277969ee1689c8742b75182.
 */
export function useENSAvatar(address?: string, enforceOwnership = true): { avatar: string | null; loading: boolean } {
  const debouncedAddress = useDebounce(address, 200)
  const node = useMemo(() => {
    if (!debouncedAddress || !isAddress(debouncedAddress)) return undefined
    return namehash(`${debouncedAddress.toLowerCase().substr(2)}.addr.reverse`)
  }, [debouncedAddress])

  const addressAvatar = useAvatarFromNode(node)
  const ENSName = useENSName(address).ENSName
  const nameAvatar = useAvatarFromNode(ENSName === null ? undefined : safeNamehash(ENSName))
  let avatar = addressAvatar.avatar || nameAvatar.avatar

  const nftAvatar = useAvatarFromNFT(avatar, enforceOwnership)
  avatar = nftAvatar.avatar || avatar

  const http = avatar && uriToHttp(avatar)[0]

  const changed = debouncedAddress !== address
  return useMemo(
    () => ({
      avatar: changed ? null : http ?? null,
      loading: changed || addressAvatar.loading || nameAvatar.loading || nftAvatar.loading,
    }),
    [addressAvatar.loading, changed, http, nameAvatar.loading, nftAvatar.loading]
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

function useAvatarFromNFT(nftUri = '', enforceOwnership: boolean): { avatar?: string; loading: boolean } {
  const parts = nftUri.toLowerCase().split(':')
  const protocol = parts[0]
  // ignore the chain from eip155
  // TODO: when we are able, pull only from the specified chain
  const [, erc] = parts[1]?.split('/') ?? []
  const [contractAddress, id] = parts[2]?.split('/') ?? []
  const isERC721 = protocol === 'eip155' && erc === 'erc721'
  const isERC1155 = protocol === 'eip155' && erc === 'erc1155'
  const erc721 = useERC721Uri(isERC721 ? contractAddress : undefined, id, enforceOwnership)
  const erc1155 = useERC1155Uri(isERC1155 ? contractAddress : undefined, id, enforceOwnership)
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
  contractAddress: string | undefined,
  id: string | undefined,
  enforceOwnership: boolean
): { uri?: string; loading: boolean } {
  const { account } = useWalletInfo()
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
  contractAddress: string | undefined,
  id: string | undefined,
  enforceOwnership: boolean
): { uri?: string; loading: boolean } {
  const { account } = useWalletInfo()
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

function getIdHex(id: string | undefined): string | undefined {
  try {
    return id ? hexZeroPad(BigNumber.from(id).toHexString(), 32).substring(2) : id
  } catch (e) {
    console.log(`Couldn't get id hex from id: ${id}`, e)

    return undefined
  }
}
