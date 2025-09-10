import { ExternalLink, InlineBanner, StatusColorVariant } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { UNSUPPORTED_SAFE_LINK } from 'modules/twap/const'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
`

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-weight: bold;
  text-align: left;
`

const WarningCheckboxWrapper = styled(CheckboxWrapper)`
  width: 100%;
  margin: 0 auto;
  border: 1px solid;
  border-radius: 16px;
  padding: 20px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
`

const WarningCheckbox = styled.label`
  display: flex;
  gap: 10px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  width: 100%;

  > input {
    --size: 21px;
    width: var(--size);
    height: var(--size);
  }
`

const InlineBannerWithCheckbox = styled(InlineBanner)``

interface FallbackHandlerWarningProps {
  isFallbackHandlerSetupAccepted: boolean

  toggleFallbackHandlerSetupFlag(isChecked: boolean): void
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function FallbackHandlerWarning({
  isFallbackHandlerSetupAccepted,
  toggleFallbackHandlerSetupFlag,
}: FallbackHandlerWarningProps) {
  const fallbackHandlerCheckbox = (
    <WarningCheckbox>
      <input
        type="checkbox"
        checked={isFallbackHandlerSetupAccepted}
        onChange={(event) => toggleFallbackHandlerSetupFlag(event.currentTarget.checked)}
        data-click-event={toCowSwapGtmEvent({
          category: CowSwapAnalyticsCategory.TWAP,
          action: 'Modify safe handler checkbox',
          label: isFallbackHandlerSetupAccepted ? 'enabled' : 'disabled',
        })}
      />
      <span>
        <Trans>Make the modification when placing order</Trans>
      </span>
    </WarningCheckbox>
  )

  if (isFallbackHandlerSetupAccepted) {
    return (
      <Wrapper>
        <InlineBanner hideIcon={true} bannerType={StatusColorVariant.Info}>
          <CheckboxWrapper>{fallbackHandlerCheckbox}</CheckboxWrapper>
        </InlineBanner>
      </Wrapper>
    )
  } else {
    return (
      <Wrapper>
        <InlineBannerWithCheckbox bannerType={StatusColorVariant.Alert}>
          <strong>
            <Trans>Your Safe needs a modification</Trans>
          </strong>
          <p>
            <Trans>
              TWAP orders require a one-time update to your Safe to enable automated execution of scheduled
              transactions.
            </Trans>
          </p>
          <ExternalLink href={UNSUPPORTED_SAFE_LINK}>
            <Trans>Learn more</Trans>
          </ExternalLink>
          <WarningCheckboxWrapper>{fallbackHandlerCheckbox}</WarningCheckboxWrapper>
        </InlineBannerWithCheckbox>
      </Wrapper>
    )
  }
}
