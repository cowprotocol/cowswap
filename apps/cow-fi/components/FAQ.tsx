import React, { useState } from 'react'
import styled from 'styled-components/macro'
import { Font, Color, Media } from '@cowprotocol/ui'
import IMG_ICON_MINUS from '@cowprotocol/assets/images/icon-minus.svg'
import IMG_ICON_PLUS from '@cowprotocol/assets/images/icon-plus.svg'
import SVG from 'react-inlinesvg'

const Wrapper = styled.div`
  --titleSize: 26px;
  --color: ${Color.neutral10};
  display: flex;
  flex-flow: column wrap;
  align-items: flex-start;
  gap: 10px;
  margin: 24px 0;
  width: 100%;
  font-size: 24px;
  font-weight: ${Font.weight.bold};

  ${Media.upToMedium()} {
    --titleSize: 18px;
  }

  a {
    color: var(--color);
    font-weight: inherit;
    text-decoration: underline;
  }

  details {
    --borderRadius: 56px;
    display: flex;
    flex-flow: column wrap;
    width: 100%;
    margin: 0 auto;
    padding: 0;
    line-height: 1;
    font-size: inherit;
    font-weight: inherit;
    position: relative;
    background: ${Color.neutral95};
    border-radius: var(--borderRadius);

    ${Media.upToMedium()} {
      font-size: 18px;
    }
  }

  details > summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: inherit;
    cursor: pointer;
    margin: 0;
    padding: 4px 4px 4px 21px;
    list-style-type: none;
    line-height: 1.2;
    position: relative;
    font-size: var(--titleSize);

    ${Media.upToMedium()} {
      padding: 14px 4px 14px 21px;
    }

    &::marker,
    &::-webkit-details-marker {
      display: none;
    }

    > i {
      --size: 56px;
      width: var(--size);
      height: var(--size);
      min-height: var(--size);
      min-width: var(--size);
      border-radius: var(--size);
      background: transparent;
      transition: background 0.2s ease-in-out;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: ${Color.neutral100};
      }
    }

    > i > svg {
      width: 100%;
      height: 100%;
      padding: 8px;
      fill: currentColor;
    }
  }

  details > div {
    --padding: 21px;
    font-size: inherit;
    line-height: 1.8;
    color: ${Color.neutral40};
    font-weight: ${Font.weight.regular};
    margin: 0;
    padding: 0 33% var(--padding) var(--padding);

    ${Media.upToMedium()} {
      padding: 0 var(--padding) var(--padding) var(--padding);
    }
  }

  details[open] {
    --borderRadius: 32px;
  }

  details[open] > div {
  }

  details[open] > summary {
  }
`

interface FAQItemProps {
  question: string
  answer: string | React.ReactNode
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsOpen(!isOpen)
  }

  return (
    <details open={isOpen}>
      <summary onClick={handleToggle}>
        {question}
        {isOpen ? (
          <i>
            <SVG src={IMG_ICON_MINUS} />
          </i>
        ) : (
          <i>
            <SVG src={IMG_ICON_PLUS} />
          </i>
        )}
      </summary>
      {isOpen && <div>{answer}</div>}
    </details>
  )
}

interface FAQComponentProps {
  faqs: FAQItemProps[]
}

const FAQComponent: React.FC<FAQComponentProps> = ({ faqs }) => {
  return (
    <Wrapper>
      {faqs.map((faq, index) => (
        <FAQItem key={index} question={faq.question} answer={faq.answer} />
      ))}
    </Wrapper>
  )
}

export default FAQComponent
