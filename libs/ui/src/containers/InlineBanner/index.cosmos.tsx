import styled from 'styled-components/macro'

import { StatusColorVariant } from '../../theme/statusColors'

import { InlineBanner } from '.'

const DemoContainer = styled.div`
  width: 100%;
  max-width: 470px;
  margin: 0 auto;
  display: flex;
  flex-flow: column wrap;
  gap: 6px;
  background: ${({ theme }) => theme.background};
  border: none;
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.boxShadow1};
  padding: 10px;
`

const Fixtures = {
  'default (alert)': (
    <DemoContainer>
      <InlineBanner>
        <strong>This is an alert banner.</strong>
      </InlineBanner>
    </DemoContainer>
  ),
  alert: (
    <DemoContainer>
      <InlineBanner bannerType={StatusColorVariant.Alert}>
        <strong>This is an alert banner (explicitly passed bannerType).</strong>
      </InlineBanner>
    </DemoContainer>
  ),
  information: (
    <DemoContainer>
      <InlineBanner bannerType={StatusColorVariant.Info}>
        <strong>Token approval bundling</strong>
        <p>
          For your convenience, token approval and order placement will be bundled into a single transaction,
          streamlining your experience!
        </p>
      </InlineBanner>
    </DemoContainer>
  ),
  success: (
    <DemoContainer>
      <InlineBanner bannerType={StatusColorVariant.Success}>
        <strong>Operation completed successfully!</strong>
      </InlineBanner>
    </DemoContainer>
  ),
  danger: (
    <DemoContainer>
      <InlineBanner bannerType={StatusColorVariant.Danger}>
        <strong>Something went wrong! Please try again.</strong>
      </InlineBanner>
    </DemoContainer>
  ),
  smallVolumeWarning: (
    <DemoContainer>
      <InlineBanner>
        <strong>Small orders are unlikely to be executed</strong>
        <p>
          For this order, network fees would be <b>1.00% (2500 COW)</b> of your sell amount! Therefore, your order is
          unlikely to execute.
        </p>
      </InlineBanner>
    </DemoContainer>
  ),
}

export default Fixtures
