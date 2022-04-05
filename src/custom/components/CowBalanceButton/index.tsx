import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { useTokenBalance } from 'state/wallet/hooks'
import { V_COW } from 'constants/tokens'
import { ChainId } from 'state/lists/actions/actionsMod'
import { formatMax, formatSmartLocaleAware } from 'utils/format'
import { AMOUNT_PRECISION } from 'constants/index'

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

export default function CowBalanceButton({ account, chainId, onClick }: CowBalanceButtonProps) {
  const vCowToken = chainId ? V_COW[chainId] : undefined
  const vCowBalance = useTokenBalance(account || undefined, vCowToken)

  const formattedVCowBalance = formatSmartLocaleAware(vCowBalance, AMOUNT_PRECISION)
  const formattedMaxVCowBalance = formatMax(vCowBalance, vCowToken?.decimals)

  return (
    <Wrapper onClick={onClick}>
      <CowProtocolLogo />
      <b title={formattedMaxVCowBalance && `${formattedMaxVCowBalance} vCOW`}>
        <Trans>{formattedVCowBalance} vCOW</Trans>
      </b>
    </Wrapper>
  )
}
