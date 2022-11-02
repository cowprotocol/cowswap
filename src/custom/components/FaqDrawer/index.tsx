import styled from 'styled-components/macro'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  gap: 0;
  margin: 0 0 24px;
`

const Item = styled.div`
  width: 100%;
  display: block;
  position: relative;
  padding: 4px 60px 12px 12px;

  > div {
    font-size: 16px;
    padding: 0;
    margin: 0;
    height: 0;
    overflow: hidden;
    position: relative;
    opacity: 0;
    transition: 0.4s ease-in-out;
  }

  > input {
    display: none;
    appearance: none;
  }

  > input:checked ~ div {
    height: auto;
    opacity: 0.7;
    margin: 0 0 12px;
  }

  > input:checked ~ label {
    padding: 0 0 12px;
  }

  > input:checked ~ label > span {
    transform: rotate(45deg);
  }

  > label {
    cursor: pointer;
    display: block;
    width: 100%;
    padding: 0;
    font-weight: 500;
    font-size: 21px;
  }

  > label > span {
    display: block;
    position: absolute;
    right: 0;
    font-size: 34px;
    top: -2px;
    line-height: 1;
    opacity: 0.5;
    transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out;
  }

  > label:hover > span {
    opacity: 1;
  }
`

type FaqDrawerProps = {
  items: {
    title: string
    content: string
  }[]
}

export function FaqDrawer({ items }: FaqDrawerProps) {
  return (
    <Wrapper>
      {items?.length > 0 &&
        items.map(({ title, content }, index) => (
          <Item key={index}>
            <input id={`q${index}`} type="checkbox" />
            <label htmlFor={`q${index}`}>
              {title} <span>+</span>
            </label>
            <div>{content}</div>
          </Item>
        ))}
    </Wrapper>
  )
}
