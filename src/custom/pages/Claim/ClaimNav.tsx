import { useMemo } from 'react'
import { ButtonSecondary } from 'components/Button'
import { shortenAddress } from 'utils'
import { TopNav, ClaimAccount, ClaimAccountButtons } from './styled'
import { ClaimCommonTypes } from './types'
import { useClaimDispatchers, useClaimState } from 'state/claim/hooks'
import { ClaimStatus } from 'state/claim/actions'

// should be updated
const DUMMY_IDENTICON =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAAXNSR0IArs4c6QAAA4ZJREFUeF7t3b1xFUEQReF5Jpj4BCC5CoIgiIFoSEAOyoEsZJEAPiaYojAxtWerWlvzye/96T5zb8/MW83t8enuZQ3+fb2/Dd59/tZffoymf90AMAsBACjAKIEUYDT9a1EACjCKIAUYTT8FWGYBZgHDY3D29noAPcAogXqA0fTrAfQAVgItBU+KEAuYzP5iASyABbCASRFiAZPZfwsW8PB8P7sUNVyA3W9/A8DeCABg7/ovAABAD7AzAxRg5+qvxQI2rz8AAGAdYGsG9ABbl18PsHn5AQAAS8F7M6AH2Lv+poGb1x8AAIjrAPXDhm8//6QafP74LsXX4Onnr19W5R4AALMAA4ACJBGjACl9a7GA+LPm6QTG+gNAD6AHSIOIArRZjCZQE5gGoCYwpU8TmP/LFQtgAWkMWgls31aygIQfC2ABw3sZZgFmAUnDWEBKHwtgAbtbQBxAGaB6/+n46uH1+bMF1Aeoewn1/tPxAIi7idMFrPcHAAAqQymeBaT09WAKQAE6ReEKFCAk74xQCkABzuDo8DUowOHUnRNIASjAOSQdvAoFOJi4s8IoAAU4i6VD16EAh9J2XhAFoADn0XTgShTgQNLODKEAFOBMnl59rawA09u50yPo6u8PgFePmf8DADAs4RTg4t8FxAE4fuoYBaAAleEUXxVQD5DSP3/wIwCGTx9nASwgakgLpwAUIBGkB0jp0wOMf9lTJTDW//LvTwEiAZpATWBEqIVXBaQALf8s4OoSGOsPAAC8VIZSfLaAx6e70TeoL3B1AKef/waANADzbiQA4kredAKvrmAUoAkABYj5u3wCKUAk4OoJvPrzs4DNAQYAAKwDFAZYQMneWprA4c00FrA5wAAAgB6gMKAHKNnTA4xvJ7OAzQEGAABaD1CPfYv5X1c/NWz6/bMCAKCdHQyAmAEK0A6epAARwKsrIAAAoAksDFCAeGxaSf6/WD2AHqAylOIpAAVIANXgqoCawFgBCkABIkItnAJc/PTwVv7eBLOAWAEWwAIiQi2cBbCARBALSOlb6/IW8PB8n/4/QP06tybw16f3sYQt/MP33+kCVcLrbxLH/0cQANpSLgAoQFIgCpDStxYLiJ82sQAWkMagJvDiR8ZQAApAAUIGzALMAgI+a5kFpPSZBeSPG/UAeoA0Bs0CzAISQDXYQpCFoMSQzaD4gxIWwALSCKzBV7eAv6T9ww6D8p2HAAAAAElFTkSuQmCC'

type ClaimNavProps = Pick<ClaimCommonTypes, 'account' | 'handleChangeAccount'>

export default function ClaimNav({ account, handleChangeAccount }: ClaimNavProps) {
  const { activeClaimAccount, activeClaimAccountENS, claimStatus } = useClaimState()
  const { setActiveClaimAccount } = useClaimDispatchers()

  const isAttempting = useMemo(() => claimStatus === ClaimStatus.ATTEMPTING, [claimStatus])

  if (!activeClaimAccount) return null

  return (
    <TopNav>
      <ClaimAccount>
        <div>
          <img src={DUMMY_IDENTICON} alt={activeClaimAccount} />
          <p>{activeClaimAccountENS ? activeClaimAccountENS : shortenAddress(activeClaimAccount)}</p>
        </div>

        <ClaimAccountButtons>
          {!!account && account !== activeClaimAccount && (
            <ButtonSecondary disabled={isAttempting} onClick={() => setActiveClaimAccount(account)}>
              Your claims
            </ButtonSecondary>
          )}

          <ButtonSecondary disabled={isAttempting} onClick={handleChangeAccount}>
            Change account
          </ButtonSecondary>
        </ClaimAccountButtons>
      </ClaimAccount>
    </TopNav>
  )
}
