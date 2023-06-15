import styled from 'styled-components/macro'

import { InlineBanner } from 'common/pure/InlineBanner'

const CheckboxWrapper = styled.div`
  font-weight: bold;
  text-align: left;
  margin-left: 25px;
`

const WarningCheckboxWrapper = styled(CheckboxWrapper)`
  width: 90%;
  margin: -50px auto 12px;
  position: relative;
  top: 70px;
`

const WarningCheckbox = styled.label`
  display: flex;
  gap: 5px;
  cursor: pointer;
`

const InlineBannerWithCheckbox = styled(InlineBanner)`
  padding-bottom: 80px;
`

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
      <span>
        Modify Safe's fallback handler
        <br /> when placing order
      </span>
    </WarningCheckbox>
  )

  if (isFallbackHandlerSetupAccepted) {
    return (
      <div>
        <InlineBanner hideIcon={true} type="information">
          <CheckboxWrapper>{fallbackHandlerCheckbox}</CheckboxWrapper>
        </InlineBanner>
      </div>
    )
  } else {
    return (
      <div>
        <InlineBannerWithCheckbox type="alert">
          <strong>Unsupported Safe detected</strong>
          <br />
          Connected Safe lacks required fallback handler. Switch to a compatible Safe or modify fallback handler for
          TWAP orders when placing your order.{' '}
          {/*<HashLink to="/faq/limit-order#how-do-fees-work">Learn more</HashLink>*/}
          {/*TODO: set a proper link*/}
          <WarningCheckboxWrapper>{fallbackHandlerCheckbox}</WarningCheckboxWrapper>
        </InlineBannerWithCheckbox>
      </div>
    )
  }
}
