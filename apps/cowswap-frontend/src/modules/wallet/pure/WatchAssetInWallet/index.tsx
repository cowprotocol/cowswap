import { useMemo } from 'react'

import { useTheme } from '@cowprotocol/common-hooks'
import { Command } from '@cowprotocol/types'
import { UI } from '@cowprotocol/ui'
import { RowFixed, TokenSymbol } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { CheckCircle } from 'react-feather'
import styled from 'styled-components/macro'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

export const ButtonCustom = styled.button`
  display: flex;
  flex: 1 1 auto;
  align-self: center;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  min-height: 52px;
  border: 1px solid ${({ theme }) => theme.border2};
  color: inherit;
  background: transparent;
  outline: 0;
  padding: 8px 16px;
  margin: 16px 0 0;
  font-size: 14px;
  line-height: 1;
  font-weight: 500;
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.border2};
  }

  > a {
    display: flex;
    align-items: center;
    color: inherit;
    text-decoration: none;
  }
`

const StyledIcon = styled.img`
  height: auto;
  width: 20px;
  max-height: 100%;
  margin: 0 10px 0 0;
`

const CheckCircleCustom = styled(CheckCircle)`
  height: auto;
  width: 20px;
  max-height: 100%;
  margin: 0 10px 0 0;
`

export type WatchAssetInWalletProps = {
  currency: Currency | undefined
  walletIcon: string
  walletName: string
  shortLabel?: boolean
  addToken: Command
  success?: boolean
  className?: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function WatchAssetInWallet(props: WatchAssetInWalletProps) {
  const { className, walletIcon, walletName, currency, shortLabel, addToken, success } = props
  const theme = useTheme()

  const analyticsEvent = useMemo(
    () => ({
      category: CowSwapAnalyticsCategory.WALLET,
      action: 'Add Token To Wallet',
      label: currency ? `${currency.symbol}|${walletName}` : 'unknown',
    }),
    [currency, walletName],
  )

  return (
    <ButtonCustom className={className} onClick={addToken} data-click-event={toCowSwapGtmEvent(analyticsEvent)}>
      {!success ? (
        <RowFixed>
          <StyledIcon src={walletIcon} />{' '}
          {shortLabel ? (
            'Add token'
          ) : (
            <>
              Add <TokenSymbol token={currency} /> to {walletName}
            </>
          )}
        </RowFixed>
      ) : (
        <RowFixed>
          <CheckCircleCustom size={'16px'} stroke={theme.green1} />
          Added &nbsp;
          <TokenSymbol token={currency} />
        </RowFixed>
      )}
    </ButtonCustom>
  )
}
