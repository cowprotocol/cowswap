import { ReactNode, useState, KeyboardEvent } from 'react'

import { BridgeProviderInfo } from '@cowprotocol/sdk-bridging'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { ToggleArrow } from 'common/pure/ToggleArrow'

import { ClickableStopTitle, SectionContent, StopTitle as BaseStopTitle, ToggleIconContainer } from '../../styles'
import { SwapAndBridgeStatus } from '../../types'
import { BridgeRouteTitle } from '../BridgeRouteTitle'
import { RouteTitle } from '../RouteTitle'

export interface BridgeDetailsContainerProps {
  status: SwapAndBridgeStatus
  stopNumber?: number
  statusIcon: ReactNode
  titlePrefix: ReactNode
  protocolName: string
  bridgeProvider?: BridgeProviderInfo
  protocolIconShowOnly?: 'first' | 'second'
  protocolIconSize?: number
  circleSize?: number

  sellAmount: CurrencyAmount<Currency> | undefined
  buyAmount: CurrencyAmount<Currency> | undefined
  buyAmountUsd?: CurrencyAmount<Token> | null
  chainName: string

  children: ReactNode
  isCollapsible?: boolean
  defaultExpanded?: boolean
  explorerUrl?: string
}

function useToggleExpanded(
  defaultExpanded: boolean,
  isCollapsible: boolean,
): {
  isExpanded: boolean
  toggleExpanded: () => void
  onKeyDown: (e: KeyboardEvent) => void
} {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const toggleExpanded = (): void => {
    setIsExpanded((state) => !state)
  }

  const onKeyDown = (e: KeyboardEvent): void => {
    if (!isCollapsible) return
    if (!['Enter', ' '].includes(e.key)) return
    toggleExpanded()
  }

  return { isExpanded, toggleExpanded, onKeyDown }
}

interface SectionContentComponentProps {
  sellAmount: CurrencyAmount<Currency> | undefined
  buyAmount: CurrencyAmount<Currency> | undefined
  buyAmountUsd: CurrencyAmount<Token> | null | undefined
  chainName: string
  isExpanded: boolean
  children: ReactNode
}

function SectionContentComponent({
  sellAmount,
  buyAmount,
  buyAmountUsd,
  chainName,
  isExpanded,
  children,
}: SectionContentComponentProps): ReactNode {
  if (!sellAmount || !buyAmount) {
    return children
  }

  return (
    <SectionContent isExpanded={isExpanded}>
      <RouteTitle chainName={chainName} sellAmount={sellAmount} buyAmount={buyAmount} buyAmountUsd={buyAmountUsd} />
      {children}
    </SectionContent>
  )
}

interface TitleActionsComponentProps {
  explorerUrl?: string
  isCollapsible?: boolean
  isExpanded?: boolean
}

function TitleActionsComponent({ isCollapsible = false, isExpanded = false }: TitleActionsComponentProps): ReactNode {
  return (
    <>
      {isCollapsible && (
        <ToggleIconContainer>
          <ToggleArrow isOpen={isExpanded} />
        </ToggleIconContainer>
      )}
    </>
  )
}

export function BridgeDetailsContainer({
  status,
  stopNumber,
  statusIcon,
  titlePrefix,
  protocolName,
  bridgeProvider,
  protocolIconShowOnly,
  protocolIconSize,
  circleSize,
  children,
  isCollapsible = false,
  defaultExpanded = true,
  explorerUrl,
  sellAmount,
  buyAmount,
  buyAmountUsd,
  chainName,
}: BridgeDetailsContainerProps): ReactNode {
  const { isExpanded, toggleExpanded, onKeyDown } = useToggleExpanded(defaultExpanded, isCollapsible)

  const titleContent = (
    <BridgeRouteTitle
      stopNumber={stopNumber}
      status={status}
      icon={statusIcon}
      titlePrefix={titlePrefix}
      protocolName={protocolName}
      bridgeProvider={bridgeProvider}
      protocolIconShowOnly={protocolIconShowOnly}
      protocolIconSize={protocolIconSize}
      circleSize={circleSize}
    />
  )

  const StopTitleComponent = isCollapsible ? ClickableStopTitle : BaseStopTitle

  return (
    <>
      <StopTitleComponent
        onClick={isCollapsible ? toggleExpanded : undefined}
        onKeyDown={onKeyDown}
        role={isCollapsible ? 'button' : undefined}
        tabIndex={isCollapsible ? 0 : undefined}
        aria-expanded={isCollapsible ? isExpanded : undefined}
      >
        {titleContent}
        <TitleActionsComponent explorerUrl={explorerUrl} isCollapsible={isCollapsible} isExpanded={isExpanded} />
      </StopTitleComponent>
      <SectionContentComponent
        sellAmount={sellAmount}
        buyAmount={buyAmount}
        buyAmountUsd={buyAmountUsd}
        chainName={chainName}
        isExpanded={isExpanded}
      >
        {children}
      </SectionContentComponent>
    </>
  )
}
