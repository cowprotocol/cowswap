import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'

import { AMOUNT_PRECISION } from 'constants/index'
import { ClaimSummaryTitle, ClaimTotal, ClaimSummary as ClaimSummaryWrapper } from 'pages/Claim/styled'
import { formatMax, formatSmartLocaleAware } from 'utils/format'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { CowSubsidyInfoProps } from 'components/CowSubsidyModal'

const Wrapper = styled(ClaimSummaryWrapper)`
  border-radius: 100px;
`

type CowBalanceProps = Omit<CowSubsidyInfoProps, 'subsidy'> & {
  title?: string
}

const CowBalance = ({ balance, title }: CowBalanceProps) => {
  return (
    <Wrapper>
      <CowProtocolLogo size={100} />

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
