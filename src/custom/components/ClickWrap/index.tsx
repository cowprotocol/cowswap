import styled from 'styled-components/macro'
import { NavLink } from 'react-router-dom'
import { ButtonPrimary, ButtonOutlined } from 'components/Button'

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  height: auto;
  max-width: 300px;
  min-height: 100px;
  width: 100%;
  background: ${({ theme }) => theme.bg1};
  position: fixed;
  z-index: 999;
  padding: 24px;
  box-shadow: rgb(0 0 0) 0 6px 0 0, rgb(0 0 0 / 16%) 0 -6px 0 0;
  justify-content: center;
  font-size: 13px;
  line-height: 1.4;
  right: 16px;
  bottom: 50px;
  border-radius: 16px;
  left: initial;
  flex-flow: column wrap;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    bottom: 100px;
    max-width: 92%;
    margin: 0 auto;
    left: 0;
    right: 0;
    border: 4px solid black;
    box-shadow: rgb(0 0 0) 0 6px 0 0, rgb(0 0 0 / 36%) 0 0 0px 100vh;
  `};

  > div {
    width: 100%;
    display: flex;
    justify-content: center;
    flex-flow: column wrap;

    ${({ theme }) => theme.mediaWidth.upToMedium`
      max-width: 100%;
      flex-flow: column wrap;
      display: flex;
    `};
  }

  > div > p {
    text-align: left;
    margin: 0;
    width: 100%;

    ${({ theme }) => theme.mediaWidth.upToMedium`
      text-align: center;
    `};
  }
`

const Form = styled.form`
  display: flex;
  flex-flow: column wrap;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-flow: column wrap;
  `};

  > span:first-of-type {
    margin: 24px 0;
    align-items: center;
    justify-content: flex-start;
    flex-flow: column wrap;

    > label {
      width: 100%;
      font-size: 15px;
      font-weight: bold;
      display: block;

      ${({ theme }) => theme.mediaWidth.upToMedium`
        margin: 0 0 8px;
      `};
    }

    > label:not(:last-of-type) {
      margin: 0 8px 0 0;
    }
  }

  > span:last-of-type {
    display: flex;
    flex-flow: row nowrap;
    margin: 0 auto;
    width: 100%;
    align-items: center;

    > button {
      height: 100%;
      max-height: 62px;
    }

    > button:not(:last-of-type) {
      margin: 0 16px 0 0;
    }
  }
`

export default function ClickWrap() {
  return (
    <Wrapper>
      <div>
        <p>
          We use cookies to provide you with the best experience and to help improve our website and application. Please
          read our <NavLink to="/cookie-policy">Cookie Policy</NavLink> for more information. By clicking &apos;Accept
          all&apos;, you agree to the storing of cookies on your device to enhance site navigation, analyze site usage
          and provide customer support.
        </p>
        <Form>
          <span>
            <label>
              <input type="checkbox" name="cookies-necessary" value="c-necessary" checked disabled /> Necessary
            </label>
            <label>
              <input type="checkbox" name="cookies-support" value="c-support" /> Customer Support
            </label>
            <label>
              <input type="checkbox" name="cookies-analytics" value="c-analytics" /> Analytics
            </label>
          </span>

          <span>
            <ButtonOutlined>Accept selection</ButtonOutlined>
            <ButtonPrimary>Accept All</ButtonPrimary>
          </span>
        </Form>
      </div>
    </Wrapper>
  )
}
