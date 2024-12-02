import {
  COMPOSABLE_COW,
  ConditionalOrder,
  ConditionalOrderFactory,
  DEFAULT_CONDITIONAL_ORDER_REGISTRY,
  IsValidResult,
} from '@cowprotocol/cow-sdk'
import React from 'react'
import styled from 'styled-components'

const ordersFactory = new ConditionalOrderFactory(DEFAULT_CONDITIONAL_ORDER_REGISTRY)

const Container = styled.div`
  padding: 20px;
  max-width: 750px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
`

const Title = styled.h1`
  text-align: center;
  color: #333;
`

const Subtitle = styled.h2`
  text-align: center;
  color: #666;
`

const Address = styled.div`
  text-align: center;
  margin-bottom: 20px;
  color: #999;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
`

const Label = styled.label`
  display: flex;
  flex-direction: column;
  font-weight: bold;
  color: #444;
  width: 100%;
`

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  width: 100%;
`

const Textarea = styled.textarea`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  resize: vertical;
  width: 100%;
`

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  font-size: 16px;
  cursor: pointer;
  width: 100%;

  &:hover {
    background-color: #0056b3;
  }
`

const ConditionalOrderContainer = styled.div`
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
  width: 100%;
`

const ConditionalOrderTitle = styled.h3`
  margin-bottom: 10px;
  color: #333;
`

const KeyValueContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`

const KeyValuePair = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  width: 100%;
`

const Key = styled.span`
  font-weight: bold;
  color: #444;
`

const Value = styled.span`
  color: #666;
`

function IsValid({ isValid }: { isValid: IsValidResult }) {
  if (isValid.isValid) {
    return <span style={{ color: 'green' }}>true</span>
  }

  return <span style={{ color: 'red' }}>false: {isValid.reason}</span>
}

function BooleanValue({ value }: { value: boolean }) {
  return <span style={{ color: value ? 'green' : 'red' }}>{Boolean(value).toString()}</span>
}

export function SdkTools() {
  const [handler, setHandler] = React.useState('0x6cF1e9cA41f7611dEf408122793c358a3d11E5a5')
  const [salt, setSalt] = React.useState('0x000000000000000000000000000000000000000000000000000000192a56162a')
  const [staticInput, setStaticInput] = React.useState(
    '0x000000000000000000000000cb444e90d8198415266c6a2724b7900fb12fc56e000000000000000000000000a0f8904ec48a2775b8a88b40e9c171f05f7d767300000000000000000000000042cedde51198d1773590311e2a340dc06b24cb370000000000000000000000000000000000000000000000004563918244f400000000000000000000000000000000000000000000000000006f30c3f95f913d84000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000057e400000000000000000000000000000000000000000000000000000000000000000b051c2da471b8bc8b993fd373b5e6ae8b9aaea1b7a781f0fd41f7f2af7c0bda1',
  )
  const [conditionalOrder, setConditionalOrder] = React.useState<ConditionalOrder<unknown, unknown> | undefined>()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Handler:', handler)
    console.log('Salt:', salt)
    console.log('Static Input:', staticInput)

    const conditionalOrder = ordersFactory.fromParams({ handler, salt, staticInput })
    setConditionalOrder(conditionalOrder)
    console.log('Conditional Order:', conditionalOrder)
  }

  return (
    <Container>
      <Title>SDK-tools</Title>
      <Subtitle>Composable CoW</Subtitle>
      <Address>Address: {COMPOSABLE_COW}</Address>

      <Form onSubmit={handleSubmit}>
        <Label>
          Handler:
          <Input type="text" value={handler} onChange={(e) => setHandler(e.target.value)} />
        </Label>
        <Label>
          Salt:
          <Input type="text" value={salt} onChange={(e) => setSalt(e.target.value)} />
        </Label>
        <Label>
          Static Input:
          <Textarea value={staticInput} onChange={(e) => setStaticInput(e.target.value)} />
        </Label>
        <Button type="submit">Submit</Button>
      </Form>

      {conditionalOrder && (
        <ConditionalOrderContainer>
          <ConditionalOrderTitle>Conditional Order:</ConditionalOrderTitle>
          <KeyValueContainer>
            <KeyValuePair>
              <Key>Id:</Key>
              <Value>{conditionalOrder.id}</Value>
            </KeyValuePair>
            <KeyValuePair>
              <Key>Order Type:</Key>
              <Value>{conditionalOrder.orderType}</Value>
            </KeyValuePair>
            <KeyValuePair>
              <Key>isValid:</Key>
              <Value>
                <IsValid isValid={conditionalOrder.isValid()} />
              </Value>
            </KeyValuePair>
            <KeyValuePair>
              <Key>isSingleOrder:</Key>
              <Value>
                <BooleanValue value={conditionalOrder.isSingleOrder} />
              </Value>
            </KeyValuePair>
            {Object.entries(conditionalOrder.data as Object).map(([key, value]) => {
              if (!isNaN(Number(key))) return null // Ignore numeric keys

              let displayValue = value
              if (value && typeof value === 'object' && typeof value.toString === 'function') {
                displayValue = value.toString()
              }

              if (displayValue === '[object Object]') {
                displayValue = JSON.stringify(value, null, 2)
              }

              return (
                <KeyValuePair key={key}>
                  <Key>{key}:</Key>
                  <Value>{displayValue}</Value>
                </KeyValuePair>
              )
            })}
          </KeyValueContainer>
        </ConditionalOrderContainer>
      )}
    </Container>
  )
}
