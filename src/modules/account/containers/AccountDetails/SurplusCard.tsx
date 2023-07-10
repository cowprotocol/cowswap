import QuestionHelper from 'legacy/components/QuestionHelper'
import { useHigherUSDValue } from 'legacy/hooks/useStablecoinPrice'
import { ExternalLink } from 'legacy/theme'
import { supportedChainId } from 'legacy/utils/supportedChainId'

import { useWalletInfo } from 'modules/wallet'

import { FiatAmount } from 'common/pure/FiatAmount'
import { TokenAmount } from 'common/pure/TokenAmount'
import { useTotalSurplus } from 'common/state/totalSurplusState'

import { InfoCard, SurplusCardWrapper } from './styled'

export function SurplusCard() {
  const { surplusAmount, isLoading } = useTotalSurplus()

  const surplusUsdAmount = useHigherUSDValue(surplusAmount)

  // TODO: Remove these 2 lines once merged in DEVELOP (this change was cherry-picked from it, and it still needs these two lines because it doesn't have sasha refactor for supportedChainId)
  const { chainId } = useWalletInfo()
  if (!supportedChainId(chainId)) return null
  // ------- end of TODO

  return (
    <SurplusCardWrapper>
      <InfoCard>
        <div>
          <span>
            <i>
              Your total surplus <QuestionHelper text={'TODO: insert tooltip'} />
            </i>
          </span>
          <span>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              surplusAmount && (
                <b>
                  +<TokenAmount amount={surplusAmount} tokenSymbol={surplusAmount?.currency} />
                </b>
              )
            )}
            {!surplusAmount && <p>No surplus for the given time period</p>}
          </span>
          <small>{surplusUsdAmount && <FiatAmount amount={surplusUsdAmount} accurate={false} />}</small>
        </div>
        <div>
          {/* TODO: add correct link */}
          <ExternalLink href={'https://blog.cow.fi/announcing-cow-swap-surplus-notifications-f679c77702ea'}>
            Learn about surplus on CoW Swap ↗
          </ExternalLink>
        </div>
      </InfoCard>
    </SurplusCardWrapper>
  )
}
