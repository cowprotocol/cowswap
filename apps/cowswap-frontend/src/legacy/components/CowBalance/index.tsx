import { Media, TokenAmount } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

import CowProtocolLogo from 'legacy/components/CowProtocolLogo'
import { CowSubsidyInfoProps } from 'legacy/components/CowSubsidyModal'

import { ClaimSummaryTitle, ClaimTotal, ClaimSummary as ClaimSummaryWrapper } from './styled'

const Wrapper = styled(ClaimSummaryWrapper)`
  border-radius: 100px;
  margin: 0;

  ${ClaimTotal} {
    > b {
      margin: 0 0 4px;
    }

    > p {
      font-size: 24px;

      ${Media.upToSmall()} {
        font-size: 18px;
      }
    }
  }
`

type CowBalanceProps = Omit<CowSubsidyInfoProps, 'subsidy'> & {
  title?: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
          <p>
            {' '}
            <TokenAmount amount={balance} defaultValue="0" tokenSymbol={balance?.currency} />
          </p>
        </ClaimTotal>
      </div>
    </Wrapper>
  )
}

export default CowBalance
