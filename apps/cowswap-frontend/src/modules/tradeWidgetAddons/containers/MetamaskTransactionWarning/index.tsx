import { useEffect, useState } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { InlineBanner, StatusColorVariant } from '@cowprotocol/ui'
import { METAMASK_RDNS, useIsMetamaskBrowserExtensionWallet, useWidgetProviderMetaInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { ExternalProvider } from '@ethersproject/providers'
import { Currency } from '@uniswap/sdk-core'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

const Banner = styled(InlineBanner)`
  font-size: 14px;
  text-align: center;
  width: 100%;

  b {
    display: contents;
  }
`

const NetworkInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const VERSION_WHERE_BUG_WAS_FIXED = '12.10.4' // Anything smaller than this version is potentially affected by the bug

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function MetamaskTransactionWarning({ sellToken }: { sellToken: Currency }) {
  const isNativeSellToken = getIsNativeToken(sellToken)

  const { shouldDisplayMetamaskWarning, currentVersion } = useShouldDisplayMetamaskWarning()

  if (!shouldDisplayMetamaskWarning || !isNativeSellToken) return null

  const chainInfo = CHAIN_INFO[sellToken.chainId as SupportedChainId]

  return (
    <Banner bannerType={StatusColorVariant.Danger} iconSize={32}>
      {currentVersion && (
        <>
          Your Metamask extension (<b>v{currentVersion}</b>) is out of date.{' '}
        </>
      )}
      <br />
      Issues have been reported with Metamask sending transactions to the wrong chain on versions prior to{' '}
      <b>v{VERSION_WHERE_BUG_WAS_FIXED}</b>. Before you sign, please check in your wallet that the transaction is being
      sent to the network:{' '}
      <NetworkInfo>
        <SVG src={chainInfo.logo.light} height={24} width={24} /> <span>{chainInfo.label}</span>
      </NetworkInfo>
    </Banner>
  )
}

/**
 * Fetch the Metamask version using the method defined in https://docs.metamask.io/wallet/reference/json-rpc-methods/web3_clientversion
 * Returns null if the version could not be fetched
 */
async function getMetamaskVersion(provider: ExternalProvider): Promise<string | null> {
  if (!provider.request) return null

  try {
    return await provider.request({
      method: 'web3_clientVersion',
      params: [],
    })
  } catch (error) {
    console.error('Failed to get Metamask version:', error)
    return null
  }
}

const SEMVER_REGEX = /\d+\.\d+\.\d+/
const EXTRACT_SEMVER_REGEX = new RegExp(`metamask/v(${SEMVER_REGEX.source})`, 'i')
const METAMASK_EXTENSION_REGEX = /metamask/i

function extractMetamaskSemver(version: string): string | null {
  const match = version.match(EXTRACT_SEMVER_REGEX)
  return match ? match[1] : null
}

/**
 * Check whether the Metamask version is smaller than the target version
 * Returns undefined if the version is not a valid semantic version
 */
function isMetamaskSemverSmallerThanTarget(version: string, target: string): boolean | undefined {
  // Check whether the version is smaller than the target
  // We are comparing semantic versions, so the format of both should already be: major.minor.patch
  if (!SEMVER_REGEX.test(version) || !SEMVER_REGEX.test(target)) return undefined

  const [major, minor, patch] = version.split('.').map(Number)
  const [targetMajor, targetMinor, targetPatch] = target.split('.').map(Number)

  if (major < targetMajor) return true
  if (major === targetMajor && minor < targetMinor) return true
  return major === targetMajor && minor === targetMinor && patch < targetPatch
}

/**
 * Hook to check if the wallet is affected by the Metamask bug where transactions are sent to the wrong chain
 * Returns true if the wallet is affected, false if it is not
 */
function useShouldDisplayMetamaskWarning(): { shouldDisplayMetamaskWarning: boolean; currentVersion: string } {
  const [isAffected, setIsAffected] = useState<boolean | undefined>(false)
  const [currentVersion, setCurrentVersion] = useState<string>('')

  const isMetamaskBrowserExtension = useIsMetamaskBrowserExtensionWallet()

  const widgetProviderMetaInfo = useWidgetProviderMetaInfo()

  const isWidgetMetamaskBrowserExtension = widgetProviderMetaInfo.data?.providerEip6963Info?.rdns === METAMASK_RDNS

  const isMetamask = isMetamaskBrowserExtension || isWidgetMetamaskBrowserExtension

  const provider = useWalletProvider()

  useEffect(() => {
    if (!isMetamask || !provider?.provider) {
      setIsAffected(false)
      return
    }

    // Here we know we are connected to a form of Metamask
    // Fetch the version
    getMetamaskVersion(provider.provider).then((version) => {
      if (!version) {
        // No version found, assume the wallet is affected
        setIsAffected(undefined)
        setCurrentVersion('')
        return
      }
      if (!METAMASK_EXTENSION_REGEX.test(version)) {
        // Not the browser extension, assume the wallet is not affected
        // MM via SDK on mobile returns this for example: "Geth/v1.14.13-stable-eb00f169/linux-arm64/go1.23.5"
        setIsAffected(false)
        setCurrentVersion('')
        return
      }

      const semver = extractMetamaskSemver(version)

      if (!semver) {
        // Invalid version, assume the wallet is affected
        setIsAffected(undefined)
        setCurrentVersion('')
        return
      }
      setCurrentVersion(semver)

      // Check if the version is smaller than the target version where the bug was fixed
      // If the version is smaller, the wallet is still affected by the bug
      const isAffected = isMetamaskSemverSmallerThanTarget(semver, VERSION_WHERE_BUG_WAS_FIXED)
      setIsAffected(isAffected)
    })
  }, [isMetamask, provider])

  // If we don't know, show it according to the isMetamask flag
  const shouldDisplayMetamaskWarning = isAffected === undefined ? isMetamask : isAffected

  return { shouldDisplayMetamaskWarning, currentVersion }
}
