import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { useCombinedBalance } from 'state/cowToken/hooks'
import { ChainId } from 'state/lists/actions/actionsMod'
import { formatMax, formatSmartLocaleAware } from 'utils/format'
import { AMOUNT_PRECISION } from 'constants/index'
import { COW } from 'constants/tokens'

export const Wrapper = styled.div`
  ${({ theme }) => theme.card.boxShadow};
  color: ${({ theme }) => theme.text1};
  padding: 0 12px;
  font-size: 15px;
  font-weight: 500;
  height: 38px;
  display: flex;
  align-items: center;
  position: relative;
  border-radius: 12px;
  pointer-events: auto;

  > b {
    margin: 0 0 0 5px;
    color: inherit;
    font-weight: inherit;
    white-space: nowrap;

    ${({ theme }) => theme.mediaWidth.upToMedium`
      overflow: hidden;
      max-width: 100px;
      text-overflow: ellipsis;
    `};

    ${({ theme }) => theme.mediaWidth.upToSmall`
      overflow: visible;
      max-width: initial;
    `};
  }
`

interface CowBalanceButtonProps {
  account?: string | null | undefined
  chainId: ChainId | undefined
  onClick?: () => void
}

const COW_DECIMALS = COW[ChainId.MAINNET].decimals

export default function CowBalanceButton({ onClick }: CowBalanceButtonProps) {
  const combinedBalance = useCombinedBalance()

  const formattedBalance = formatSmartLocaleAware(combinedBalance, AMOUNT_PRECISION)
  const formattedMaxBalance = formatMax(combinedBalance, COW_DECIMALS)

  return (
    <Wrapper onClick={onClick}>
      <CowProtocolLogo />
      <b title={formattedMaxBalance && `${formattedMaxBalance} (v)COW`}>
        <Trans>{formattedBalance || 0}</Trans>
      </b>
    </Wrapper>
  )
}
