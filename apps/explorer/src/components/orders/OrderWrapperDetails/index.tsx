import React, { ComponentType, createContext, ReactElement, Suspense, useContext, useEffect, useState } from 'react'

import { getBlockExplorerUrl, shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { RenderedData, WrapperHeader, WrapperItem, WrapperList } from './styled'

import { Order } from '../../../api/operator'
import { useContractName } from '../../../hooks/euler'
import { usePopperDefault } from '../../../hooks/usePopper'
import { useNetworkId } from '../../../state/network/hooks'
import { getOrderWrappers, ResolvedWrapper } from '../../../utils/getOrderWrappers'
import { WRAPPERS_BY_ADDRESS } from '../../../utils/wrapperRegistry'
import { Tooltip } from '../../Tooltip'

export const OrderCtx = createContext<Order | null>(null)

export function useOrderContext(): Order | null {
  return useContext(OrderCtx)
}

interface OrderWrapperDetailsProps {
  fullAppData: string | undefined
  order?: Order
  children: (content: ReactElement) => ReactElement
}

export function OrderWrapperDetails({ fullAppData, order, children }: OrderWrapperDetailsProps): ReactElement | null {
  const wrappers = getOrderWrappers(fullAppData)

  if (wrappers.length === 0) return null

  return (
    <OrderCtx.Provider value={order ?? null}>
      {children(
        <WrapperList>
          {wrappers.map((wrapper) => (
            <WrapperEntry key={`${wrapper.address}-${wrapper.data ?? ''}`} wrapper={wrapper} />
          ))}
        </WrapperList>,
      )}
    </OrderCtx.Provider>
  )
}

const UNKNOWN_WRAPPER_TOOLTIP =
  'Explorer does not recognize this wrapper address yet, so it cannot decode wrapper-specific details. This may be a custom wrapper or a supported wrapper missing from the registry.'

function WrapperEntry({ wrapper }: { wrapper: ResolvedWrapper }): ReactElement {
  const [Component, setComponent] = useState<ComponentType<{ data: string }> | null>(null)
  const { info, address, data, isOmittable } = wrapper
  const chainId = useNetworkId() as SupportedChainId | null
  const isUnknown = !WRAPPERS_BY_ADDRESS[address.toLowerCase()]
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
      <WrapperItem {...(isUnknown ? targetProps : {})}>
        <WrapperHeader>
          {info.image && <img src={info.image} alt={info.name} />}
          <strong>{displayName}</strong>
          {addressUrl ? (
            <a href={addressUrl} target="_blank" rel="noopener noreferrer" title={address}>
              ({shortAddress})
            </a>
          ) : (
            <span title={address}>({shortAddress})</span>
          )}
          {isOmittable && <em>(omittable)</em>}
        </WrapperHeader>
        {Component && data && (
          <RenderedData>
            <Suspense fallback={<span>Loading…</span>}>
              <Component data={data} />
            </Suspense>
          </RenderedData>
        )}
      </WrapperItem>
      {isUnknown && <Tooltip {...tooltipProps}>{UNKNOWN_WRAPPER_TOOLTIP}</Tooltip>}
    </>
  )
}
