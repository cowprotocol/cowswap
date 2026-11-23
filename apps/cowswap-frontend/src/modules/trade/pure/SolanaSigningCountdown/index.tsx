import { ReactNode, useCallback, useState } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { ButtonPrimary, Media, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'
import { Nullish } from 'types'

import { MilkGlass } from 'common/pure/MilkGlassCountdown/MilkGlass/MilkGlass.pure'
import { MilkGlassCountdown } from 'common/pure/MilkGlassCountdown/MilkGlassCountdown.pure'
import { NewModal, NewModalProps } from 'common/pure/NewModal'

import { SolanaTradeAmountsRow } from '../SolanaTradeAmountsRow'

// The expired hero's amber palette comes verbatim from the Figma frame (node 5565:11111); the
// alert tokens in the UI kit are a different, darker set.
const EXPIRED_HERO_BG = '#ffdb9c'
const EXPIRED_DIGITS_COLOR = '#996815'
const EXPIRED_TEXT_COLOR = '#6b4710'

export type SolanaSigningCountdownProps = NewModalProps & {
  /** Epoch ms when the transaction's blockhash is expected to die. */
  expiresAt: number
  /** Full signing window in ms, for the milk level. */
  durationMs: number
  inputAmount: Nullish<CurrencyAmount<Currency>>
  outputAmount: Nullish<CurrencyAmount<Currency>>
  recipient?: Nullish<string>
  /** Replaces `onDismiss` once the window has closed — the natural exit then is back to the review
   * screen for another attempt, not out of the modal. */
  onExpiredDismiss?: NewModalProps['onDismiss']
}

export function SolanaSigningCountdown(props: SolanaSigningCountdownProps): ReactNode {
  const { expiresAt, durationMs, inputAmount, outputAmount, recipient, onExpiredDismiss, ...rest } = props

  const targetEpochSec = Math.floor(expiresAt / 1000)
  const [isExpired, setIsExpired] = useState(() => targetEpochSec <= Date.now() / 1000)

  const onRemainingChange = useCallback((remainingSec: number) => {
    if (remainingSec <= 0) {
      setIsExpired(true)
    }
  }, [])

  const onDismiss = isExpired && onExpiredDismiss ? onExpiredDismiss : rest.onDismiss

  return (
    <NewModal
      {...rest}
      onDismiss={onDismiss}
      title={isExpired ? <Trans>Signing time expired</Trans> : undefined}
      contentPadding={isExpired ? '16px' : '56px 16px 16px'}
    >
      <HeroGroup>
        <Hero $isExpired={isExpired}>
          {isExpired ? (
            <>
              <ExpiredTimerColumn>
                <ExpiredDigits>00:00</ExpiredDigits>
                <ExpiredHeading>
                  <Trans>Signing time expired</Trans>
                </ExpiredHeading>
                <ExpiredHint>
                  <Trans>Review your swap to get a fresh signing request.</Trans>
                </ExpiredHint>
              </ExpiredTimerColumn>
              <GlassBox>
                <MilkGlass fraction={0} isExpired />
              </GlassBox>
            </>
          ) : (
            <MilkGlassCountdown
              targetEpochSec={targetEpochSec}
              durationMs={durationMs}
              useLocalClock
              onRemainingChange={onRemainingChange}
              label={<Trans>To sign the transaction in your wallet</Trans>}
            />
          )}
        </Hero>

        <SolanaTradeAmountsRow inputAmount={inputAmount} outputAmount={outputAmount} recipient={recipient} />
      </HeroGroup>

      {isExpired && (
        <BackToReviewButton onClick={onDismiss}>
          <Trans>Back to review</Trans>
        </BackToReviewButton>
      )}
    </NewModal>
  )
}

const HeroGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  border-radius: 21px;
  overflow: hidden;
`

const Hero = styled.div<{ $isExpired: boolean }>`
  display: flex;
  flex-wrap: wrap;
  flex: 1;
  align-items: center;
  align-content: center;
  justify-content: center;
  gap: 16px 28px;
  width: 100%;
  min-height: 260px;
  padding: ${({ $isExpired }) => ($isExpired ? '24px 28px' : '0')};
  background: ${({ $isExpired }) => ($isExpired ? EXPIRED_HERO_BG : `var(${UI.COLOR_BLUE_300_PRIMARY})`)};
  color: var(${UI.COLOR_TEXT});
`

const ExpiredTimerColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  width: 204px;

  ${Media.upToExtraSmall()} {
    align-items: center;
    text-align: center;
  }
`

const GlassBox = styled.div`
  display: flex;
  justify-content: center;
  flex: 0 0 150px;
`

const ExpiredDigits = styled.span`
  font-size: 40px;
  line-height: 52px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: ${EXPIRED_DIGITS_COLOR};
`

const ExpiredHeading = styled.span`
  font-size: 16px;
  line-height: 22px;
  font-weight: 600;
  color: ${EXPIRED_TEXT_COLOR};
`

const ExpiredHint = styled.span`
  font-size: 14px;
  line-height: 20px;
  color: ${EXPIRED_TEXT_COLOR};
`

const BackToReviewButton = styled(ButtonPrimary)`
  width: 100%;
  min-height: 58px;
  margin-top: 16px;
  font-size: 18px;
`
