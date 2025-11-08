import { MouseEventHandler, ReactNode, useMemo } from 'react'

import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { LpToken, TokenWithLogo } from '@cowprotocol/common-const'
import { TokenLogo } from '@cowprotocol/tokens'
import { LoadingRows, LoadingRowSmall, TokenAmount, TokenName, TokenSymbol } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { VirtualItem } from '@tanstack/react-virtual'
import { Info } from 'react-feather'

import { PoolInfoStates } from 'modules/yield/shared'

import {
  ListItem,
  LpTokenBalance,
  LpTokenInfo,
  LpTokenTooltip,
  LpTokenWrapper,
  LpTokenYieldPercentage,
  MobileCard,
  MobileCardLabel,
  MobileCardRow,
  MobileCardValue,
} from './styled'

interface LpTokenRowRendererParams {
  balances: BalancesState['values']
  poolsInfo: PoolInfoStates | undefined
  openPoolPage(poolAddress: string): void
  onSelectToken(token: TokenWithLogo): void
  isMobile: boolean
  account: string | undefined
}

const LoadingElement = (
  <LoadingRows>
    <LoadingRowSmall />
  </LoadingRows>
)

const MobileCardRowItem: React.FC<{ label: string; value: ReactNode }> = ({ label, value }) => (
  <MobileCardRow>
    <MobileCardLabel>{label}:</MobileCardLabel>
    <MobileCardValue>{value}</MobileCardValue>
  </MobileCardRow>
)

export function useLpTokenRowRenderer({
  balances,
  poolsInfo,
  openPoolPage,
  onSelectToken,
  isMobile,
  account,
}: LpTokenRowRendererParams): (lpTokens: LpToken[], item: VirtualItem) => ReactNode {
  return useMemo(
    () =>
      createLpTokenRowRenderer({
        balances,
        poolsInfo,
        openPoolPage,
        onSelectToken,
        isMobile,
        account,
      }),
    [balances, poolsInfo, openPoolPage, onSelectToken, isMobile, account],
  )
}

function createLpTokenRowRenderer(params: LpTokenRowRendererParams): (lpTokens: LpToken[], item: VirtualItem) => ReactNode {
  return LpTokenRowRendererFactory(params)
}

type LpTokenRowRendererFactoryParams = LpTokenRowRendererParams

function LpTokenRowRendererFactory({
  balances,
  poolsInfo,
  openPoolPage,
  onSelectToken,
  isMobile,
  account,
}: LpTokenRowRendererFactoryParams): (lpTokens: LpToken[], item: VirtualItem) => ReactNode {
  return (lpTokens: LpToken[], item: VirtualItem): ReactNode =>
    renderLpTokenRow({
      lpTokens,
      item,
      balances,
      poolsInfo,
      openPoolPage,
      onSelectToken,
      isMobile,
      account,
    })
}

interface RenderLpTokenRowParams extends LpTokenRowRendererParams {
  lpTokens: LpToken[]
  item: VirtualItem
}

function renderLpTokenRow({
  lpTokens,
  item,
  balances,
  poolsInfo,
  openPoolPage,
  onSelectToken,
  isMobile,
  account,
}: RenderLpTokenRowParams): ReactNode {
  const token = lpTokens[item.index]
  const tokenAddressLower = token.address.toLowerCase()
  const balance = balances ? balances[tokenAddressLower] : undefined
  const balanceAmount = balance ? CurrencyAmount.fromRawAmount(token, balance.toHexString()) : undefined
  const info = poolsInfo?.[tokenAddressLower]?.info
  const onInfoClick = createInfoClickHandler(openPoolPage, tokenAddressLower)
  const balanceDisplay = balanceAmount ? <TokenAmount amount={balanceAmount} /> : account ? LoadingElement : null

  return (
    <LpTokenRowRenderer
      key={token.address}
      token={token}
      balanceDisplay={balanceDisplay}
      apy={info?.apy}
      onInfoClick={onInfoClick}
      onSelectToken={onSelectToken}
      isMobile={isMobile}
    />
  )
}

function createInfoClickHandler(
  openPoolPage: (poolAddress: string) => void,
  tokenAddress: string,
): MouseEventHandler<HTMLDivElement> {
  return (event) => {
    event.stopPropagation()
    openPoolPage(tokenAddress)
  }
}

interface LpTokenRowProps {
  token: LpToken
  balanceDisplay: ReactNode
  apy?: number
  onInfoClick: MouseEventHandler<HTMLDivElement>
  onSelectToken(token: TokenWithLogo): void
}

interface LpTokenRowRendererProps extends LpTokenRowProps {
  isMobile: boolean
}

function LpTokenRowRenderer({
  token,
  balanceDisplay,
  apy,
  onInfoClick,
  onSelectToken,
  isMobile,
}: LpTokenRowRendererProps): ReactNode {
  if (isMobile) {
    return (
      <LpTokenMobileCard
        token={token}
        balanceDisplay={balanceDisplay}
        apy={apy}
        onInfoClick={onInfoClick}
        onSelectToken={onSelectToken}
      />
    )
  }

  return (
    <LpTokenDesktopRow
      token={token}
      balanceDisplay={balanceDisplay}
      apy={apy}
      onInfoClick={onInfoClick}
      onSelectToken={onSelectToken}
    />
  )
}

function LpTokenDesktopRow({ token, balanceDisplay, apy, onInfoClick, onSelectToken }: LpTokenRowProps): ReactNode {
  return (
    <ListItem
      data-address={token.address}
      data-token-symbol={token.symbol || ''}
      data-token-name={token.name || ''}
      data-element-type="token-selection"
      onClick={() => onSelectToken(token)}
    >
      <LpTokenWrapper>
        <LpTokenSummary token={token} />
      </LpTokenWrapper>
      <LpTokenBalance>{balanceDisplay}</LpTokenBalance>
      <LpTokenYieldPercentage>{formatApy(apy)}</LpTokenYieldPercentage>
      <LpTokenTooltip onClick={onInfoClick}>
        <Info size={18} />
      </LpTokenTooltip>
    </ListItem>
  )
}

function LpTokenMobileCard({ token, balanceDisplay, apy, onInfoClick, onSelectToken }: LpTokenRowProps): ReactNode {
  return (
    <MobileCard
      data-address={token.address}
      data-token-symbol={token.symbol || ''}
      data-token-name={token.name || ''}
      data-element-type="token-selection"
      onClick={() => onSelectToken(token)}
    >
      <MobileCardRow>
        <LpTokenSummary token={token} isMobile />
      </MobileCardRow>
      <MobileCardRowItem label="Balance" value={balanceDisplay} />
      <MobileCardRowItem label="APR" value={formatApy(apy)} />
      <MobileCardRowItem
        label="Details"
        value={
          <LpTokenTooltip onClick={onInfoClick}>
            Pool details
            <Info size={18} />
          </LpTokenTooltip>
        }
      />
    </MobileCard>
  )
}

function LpTokenSummary({ token, isMobile }: { token: LpToken; isMobile?: boolean }): ReactNode {
  return (
    <>
      <TokenLogo token={token} sizeMobile={isMobile ? 24 : 32} />
      <LpTokenInfo>
        <strong>
          <TokenSymbol token={token} />
        </strong>
        <p>
          <TokenName token={token} />
        </p>
      </LpTokenInfo>
    </>
  )
}

function formatApy(apy: number | undefined): ReactNode {
  return apy ? `${apy}%` : ''
}
