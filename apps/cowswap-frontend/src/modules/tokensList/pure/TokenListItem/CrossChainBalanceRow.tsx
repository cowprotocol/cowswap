import { MouseEvent, ReactNode } from 'react'

import { getChainInfo, TokenWithLogo } from '@cowprotocol/common-const'
import { useTheme } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Token } from '@cowprotocol/currency'
import { TokenAmount } from '@cowprotocol/ui'

import { Nullish } from 'types'

import * as styledEl from './CrossChainBalanceRow.styled'

import { CrossChainBalancePerNetwork } from '../../hooks/useCrossChainBalances'
import { checkIsTokenSelected } from '../../utils/checkIsTokenSelected'

export interface CrossChainBalanceRowProps {
  perNetwork: CrossChainBalancePerNetwork[]
  selectedToken?: Nullish<Currency>
  onSelectNetworkToken(chainId: SupportedChainId, token: TokenWithLogo): void
}

interface NetworkChipProps {
  chainId: SupportedChainId
  token: TokenWithLogo
  amount: CurrencyAmount<Token>
  isDarkMode: boolean
  isSelected: boolean
  onSelectNetworkToken(chainId: SupportedChainId, token: TokenWithLogo): void
}

export function CrossChainBalanceRow({
  perNetwork,
  selectedToken,
  onSelectNetworkToken,
}: CrossChainBalanceRowProps): ReactNode {
  const { darkMode } = useTheme()

  if (perNetwork.length === 0) return null

  return (
    <styledEl.Row>
      {perNetwork.map(({ chainId, token, amount }) => (
        <NetworkChip
          key={chainId}
          chainId={chainId}
          token={token}
          amount={amount}
          isDarkMode={darkMode}
          isSelected={checkIsTokenSelected(token, selectedToken)}
          onSelectNetworkToken={onSelectNetworkToken}
        />
      ))}
    </styledEl.Row>
  )
}

function NetworkChip({
  chainId,
  token,
  amount,
  isDarkMode,
  isSelected,
  onSelectNetworkToken,
}: NetworkChipProps): ReactNode {
  const chainInfo = getChainInfo(chainId)
  const logoSrc = isDarkMode ? chainInfo.logo.dark : chainInfo.logo.light

  const handleClick = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    onSelectNetworkToken(chainId, token)
  }

  return (
    <styledEl.Chip type="button" onClick={handleClick} title={chainInfo.label} selected$={isSelected}>
      <img src={logoSrc} alt={chainInfo.label} loading="lazy" />
      <TokenAmount amount={amount} />
    </styledEl.Chip>
  )
}
