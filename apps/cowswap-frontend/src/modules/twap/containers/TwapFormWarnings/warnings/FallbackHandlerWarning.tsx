import { ExternalLink, InlineBanner } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { UNSUPPORTED_SAFE_LINK } from 'modules/twap/const'

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
      />
      <span>Make the modification when placing order</span>
    </WarningCheckbox>
  )

  if (isFallbackHandlerSetupAccepted) {
    return (
      <Wrapper>
        <InlineBanner hideIcon={true} bannerType="information">
          <CheckboxWrapper>{fallbackHandlerCheckbox}</CheckboxWrapper>
        </InlineBanner>
      </Wrapper>
    )
  } else {
    return (
      <Wrapper>
        <InlineBannerWithCheckbox bannerType="alert">
          <strong>Your Safe needs a modification</strong>
          <p>
            TWAP orders require a one-time update to your Safe to enable automated execution of scheduled transactions.
          </p>
          <ExternalLink href={UNSUPPORTED_SAFE_LINK}>Learn more</ExternalLink>
          <WarningCheckboxWrapper>{fallbackHandlerCheckbox}</WarningCheckboxWrapper>
        </InlineBannerWithCheckbox>
      </Wrapper>
    )
  }
}
