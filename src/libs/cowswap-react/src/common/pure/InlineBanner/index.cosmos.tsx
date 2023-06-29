import { DemoContainer } from 'cosmos.decorator'

import { InlineBanner } from '.'

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
      <InlineBanner type="alert">
        <strong>This is an alert banner (explicitly passed type).</strong>
      </InlineBanner>
    </DemoContainer>
  ),
  information: (
    <DemoContainer>
      <InlineBanner type="information">
        <>
          <strong>Token approval</strong>: For your convenience, token approval and order placement will be bundled into
          a single transaction, streamlining your experience!
        </>
      </InlineBanner>
    </DemoContainer>
  ),
  success: (
    <DemoContainer>
      <InlineBanner type="success">
        <strong>Operation completed successfully!</strong>
      </InlineBanner>
    </DemoContainer>
  ),
  danger: (
    <DemoContainer>
      <InlineBanner type="danger">
        <strong>Something went wrong! Please try again.</strong>
      </InlineBanner>
    </DemoContainer>
  ),
  smallVolumeWarning: (
    <DemoContainer>
      <InlineBanner>
        <>
          Small orders are unlikely to be executed. For this order, network fees would be <b>1.00% (2500 COW)</b> of
          your sell amount! Therefore, your order is unlikely to execute.
        </>
      </InlineBanner>
    </DemoContainer>
  ),
}

export default Fixtures
