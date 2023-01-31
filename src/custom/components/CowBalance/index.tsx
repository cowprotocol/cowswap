import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'

import { AMOUNT_PRECISION } from 'constants/index'
import { ClaimSummaryTitle, ClaimTotal, ClaimSummary as ClaimSummaryWrapper } from '@cow/pages/Claim/styled'
import { formatMax, formatSmartLocaleAware } from '@cow/utils/format'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { CowSubsidyInfoProps } from 'components/CowSubsidyModal'

const Wrapper = styled(ClaimSummaryWrapper)`
  border-radius: 100px;
  margin: 0;

  ${ClaimTotal} {
    > b {
      margin: 0 0 4px;
    }

    > p {
      font-size: 24px;

      ${({ theme }) => theme.mediaWidth.upToSmall`
        font-size: 18px;
      `};
    }
  }
`

type CowBalanceProps = Omit<CowSubsidyInfoProps, 'subsidy'> & {
  title?: string
}

const CowBalance = ({ balance, title }: CowBalanceProps) => {
  return (
    <Wrapper>
      <CowProtocolLogo size={80} />

      {title && (
        <ClaimSummaryTitle>
          <Trans>{title}</Trans>
        </ClaimSummaryTitle>
      )}

      <div>
        <ClaimTotal>
          <b>Your combined balance</b>
          <p title={`${balance ? formatMax(balance, balance.currency.decimals) : '0'} vCOW`}>
            {' '}
            {formatSmartLocaleAware(balance, AMOUNT_PRECISION) || '0'} (v)COW
          </p>
        </ClaimTotal>
      </div>
    </Wrapper>
  )
}

export default CowBalance
