import { InlineBanner } from '.'
import styled from 'styled-components/macro'

const Wrapper = styled.div`
  max-width: 470px;
  width: 100%;
  height: 100%;
  padding: 50px 10px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.grey1};
`

const Fixtures = {
  'default (alert)': (
    <Wrapper>
      <InlineBanner content={<strong>This is an alert banner.</strong>} />
    </Wrapper>
  ),
  alert: (
    <Wrapper>
      <InlineBanner type="alert" content={<strong>This is an alert banner (explicitly passed type).</strong>} />
    </Wrapper>
  ),
  information: (
    <Wrapper>
      <InlineBanner
        type="information"
        content={
          <>
            <strong>Token approval</strong>: For your convenience, token approval and order placement will be bundled
            into a single transaction, streamlining your experience!
          </>
        }
      />
    </Wrapper>
  ),
  success: (
    <Wrapper>
      <InlineBanner type="success" content={<strong>Operation completed successfully!</strong>} />
    </Wrapper>
  ),
  danger: (
    <Wrapper>
      <InlineBanner type="danger" content={<strong>Something went wrong! Please try again.</strong>} />
    </Wrapper>
  ),
  smallVolumeWarning: (
    <Wrapper>
      <InlineBanner
        content={
          <>
            Small orders are unlikely to be executed. For this order, network fees would be <b>1.00% (2500 COW)</b> of
            your sell amount! Therefore, your order is unlikely to execute.
          </>
        }
      />
    </Wrapper>
  ),
}

export default Fixtures
