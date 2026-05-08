import { ComponentType, ReactElement, Suspense, useEffect, useState } from 'react'

import { getBlockExplorerUrl, shortenAddress } from '@cowprotocol/common-utils'
import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

import * as styledEl from './OrderWrapperDetailsItem.styled'

import { useContractName } from '../../../../hooks/euler'
import { usePopperDefault } from '../../../../hooks/usePopper'
import { useNetworkId } from '../../../../state/network/hooks'
import { ResolvedWrapper } from '../../../../utils/getOrderWrappers'
import { WRAPPERS_BY_ADDRESS } from '../../../../utils/wrappers/wrapperRegistry.constants'
import { Tooltip } from '../../../Tooltip'

const UNKNOWN_WRAPPER_TOOLTIP =
  'Explorer does not recognize this wrapper address yet, so it cannot decode wrapper-specific details. This may be a custom wrapper or a supported wrapper missing from the registry.'

export function OrderWrapperDetailsItem({ wrapper }: { wrapper: ResolvedWrapper }): ReactElement {
  const [Component, setComponent] = useState<ComponentType<{ data: string }> | null>(null)
  const { info, address, data, isOmittable } = wrapper
  const chainId = useNetworkId() as SupportedChainId | null
  const isUnknown = !WRAPPERS_BY_ADDRESS[getAddressKey(address)]
  const contractName = useContractName(isUnknown ? address : '')
  const { tooltipProps, targetProps } = usePopperDefault<HTMLLIElement>('top')

  useEffect(() => {
    if (!data || !wrapper.loadComponent) return
    wrapper.loadComponent().then((Comp) => setComponent(() => Comp))
  }, [wrapper, data])

  const addressUrl = chainId ? getBlockExplorerUrl(chainId, 'contract', address) : undefined
  const shortAddress = shortenAddress(address)
  const displayName = isUnknown ? (contractName ?? shortAddress) : info.name

  return (
    <>
      <styledEl.WrapperItem {...(isUnknown ? targetProps : {})}>
        <styledEl.WrapperHeader>
          {info.image && <img src={info.image} alt={info.name} />}
          <strong>{displayName}</strong>
          {addressUrl ? (
            <span>
              (
              <a href={addressUrl} target="_blank" rel="noopener noreferrer" title={address}>
                {shortAddress}↗
              </a>
              )
            </span>
          ) : (
            <span title={address}>({shortAddress})</span>
          )}
          {isOmittable && <em>(omittable)</em>}
        </styledEl.WrapperHeader>
        {Component && data && (
          <styledEl.RenderedData>
            <Suspense fallback={<span>Loading…</span>}>
              <Component data={data} />
            </Suspense>
          </styledEl.RenderedData>
        )}
      </styledEl.WrapperItem>
      {isUnknown && <Tooltip {...tooltipProps}>{UNKNOWN_WRAPPER_TOOLTIP}</Tooltip>}
    </>
  )
}
