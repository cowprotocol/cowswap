import { ButtonSecondary } from 'legacy/components/Button'
import { shortenAddress } from 'legacy/utils'
import { TopNav, ClaimAccount, ClaimAccountButtons } from './styled'
import { ClaimCommonTypes } from './types'
import { useClaimDispatchers, useClaimState } from 'legacy/state/claim/hooks'
import { ClaimStatus } from 'legacy/state/claim/actions'
import { Identicon } from 'modules/wallet/api/container/Identicon'
import CopyHelper from 'legacy/components/Copy'

type ClaimNavProps = Pick<ClaimCommonTypes, 'account' | 'handleChangeAccount'>

export default function ClaimNav({ account, handleChangeAccount }: ClaimNavProps) {
  const { activeClaimAccount, activeClaimAccountENS, claimStatus, investFlowStep } = useClaimState()
  const { setActiveClaimAccount, setIsSearchUsed } = useClaimDispatchers()

  const isDefaultStatus = claimStatus === ClaimStatus.DEFAULT
  const isConfirmed = claimStatus === ClaimStatus.CONFIRMED
  const hasActiveAccount = activeClaimAccount !== ''
  const allowToChangeAccount = investFlowStep < 2 && (isDefaultStatus || isConfirmed)

  return (
    <TopNav>
      <ClaimAccount>
        <div>
          {hasActiveAccount && (
            <>
              <Identicon account={activeClaimAccount} size={46} />
              <p>{activeClaimAccountENS ? activeClaimAccountENS : shortenAddress(activeClaimAccount)} </p>
              <CopyHelper toCopy={activeClaimAccount} />
            </>
          )}
        </div>
        <ClaimAccountButtons>
          {allowToChangeAccount && hasActiveAccount ? (
            <ButtonSecondary onClick={handleChangeAccount}>Change account</ButtonSecondary>
          ) : (
            !!account &&
            allowToChangeAccount && (
              <ButtonSecondary
                onClick={() => {
                  setActiveClaimAccount(account)
                  setIsSearchUsed(false)
                }}
              >
                Switch to connected account
              </ButtonSecondary>
            )
          )}
        </ClaimAccountButtons>
      </ClaimAccount>
    </TopNav>
  )
}
