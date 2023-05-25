import { InlineBanner } from '.'
import { DemoContainer } from 'cosmos.decorator'

const Fixtures = {
  'default (alert)': (
    <DemoContainer>
      <InlineBanner content={<strong>This is an alert banner.</strong>} />
    </DemoContainer>
  ),
  alert: (
    <DemoContainer>
      <InlineBanner type="alert" content={<strong>This is an alert banner (explicitly passed type).</strong>} />
    </DemoContainer>
  ),
  information: (
    <DemoContainer>
      <InlineBanner
        type="information"
        content={
          <>
            <strong>Token approval</strong>: For your convenience, token approval and order placement will be bundled
            into a single transaction, streamlining your experience!
          </>
        }
      />
    </DemoContainer>
  ),
  success: (
    <DemoContainer>
      <InlineBanner type="success" content={<strong>Operation completed successfully!</strong>} />
    </DemoContainer>
  ),
  danger: (
    <DemoContainer>
      <InlineBanner type="danger" content={<strong>Something went wrong! Please try again.</strong>} />
    </DemoContainer>
  ),
  smallVolumeWarning: (
    <DemoContainer>
      <InlineBanner
        content={
          <>
            Small orders are unlikely to be executed. For this order, network fees would be <b>1.00% (2500 COW)</b> of
            your sell amount! Therefore, your order is unlikely to execute.
          </>
        }
      />
    </DemoContainer>
  ),
}

export default Fixtures
