import { useCallback, useState } from 'react'

import { capitalizeFirstLetter } from '@cowprotocol/common-utils'
import { ButtonPrimary } from '@cowprotocol/ui'

import { MessageDescriptor } from '@lingui/core'
import { msg, t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'

import { CowHook, HookDappProps } from '../../types/hooks'
import { ContentWrapper, Row, Wrapper, ErrorText } from '../styled'

interface FormFieldParams {
  name: string
  label: MessageDescriptor
  type: string
  rows?: number
}
const DEFAULT_HOOK_STATE: CowHook = {
  target: '',
  callData: '',
  gasLimit: '',
  dappId: '',
}

const DEFAULT_ERRORS_STATE: Record<keyof CowHook, string> = {
  target: '',
  callData: '',
  gasLimit: '',
  dappId: '',
}

const FIELDS: ReadonlyArray<FormFieldParams> = [
  { name: 'target', label: msg`Target`, type: 'text' },
  { name: 'gasLimit', label: msg`Gas limit`, type: 'number' },
  { name: 'callData', label: msg`Calldata`, type: 'textarea', rows: 8 },
]

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function BuildHookApp({ context }: HookDappProps) {
  const hookToEdit = context.hookToEdit
  const isPreHook = context.isPreHook
  const [hook, setHook] = useState<CowHook>(hookToEdit?.hook || DEFAULT_HOOK_STATE)
  const [errors, setErrors] = useState<Record<keyof CowHook, string>>(DEFAULT_ERRORS_STATE)

  const validateInput = useCallback((name: keyof CowHook, value: string) => {
    setErrors((prev) => ({ ...prev, [name]: value.trim() ? '' : `${capitalizeFirstLetter(name)} ` + t`is required` }))
  }, [])

  const handleInputChange = useCallback(
    ({ name, value }: { name: string; value: string }) => {
      setHook((prev) => ({ ...prev, [name]: value }))
      validateInput(name as keyof CowHook, value)
    },
    [validateInput],
  )

  const handleSubmit = useCallback(() => {
    const newErrors: Record<keyof CowHook, string> = { ...DEFAULT_ERRORS_STATE }

    const hasErrors = Object.entries(hook).some(([key, value]) => {
      if (key === 'dappId') return false

      if (!value.trim()) {
        newErrors[key as keyof CowHook] = `${capitalizeFirstLetter(key)} ` + t`is required`
        return true
      }
      return false
    })

    if (hasErrors) {
      setErrors(newErrors)
      return
    }

    hookToEdit
      ? context.editHook({
          ...hookToEdit,
          hook,
        })
      : context.addHook({ hook })
  }, [hook, context, hookToEdit])

  return (
    <Wrapper>
      <ContentWrapper>
        {FIELDS.map((params) => {
          return (
            <FormField
              key={params.name}
              params={params}
              value={hook[params.name as keyof CowHook]}
              error={errors[params.name as keyof CowHook]}
              onChange={handleInputChange}
            />
          )
        })}
      </ContentWrapper>
      <ButtonPrimary onClick={handleSubmit}>
        {hookToEdit ? t`Save changes` : t`Add` + (isPreHook ? t`Pre` : t`Post`) + `-hook`}
      </ButtonPrimary>
    </Wrapper>
  )
}

interface FormFieldProps {
  params: FormFieldParams
  value: string
  error: string
  onChange(value: { name: string; value: string }): void
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function FormField({ params, value, error, onChange }: FormFieldProps) {
  const { name, label, type, rows } = params
  const { i18n } = useLingui()

  return (
    <>
      <Row key={name}>
        {type === 'textarea' ? (
          <textarea
            name={name}
            placeholder=" "
            value={value}
            onChange={(e) => onChange(e.target)}
            className={error ? 'error' : ''}
            required
            rows={rows}
          />
        ) : (
          <input
            type={type}
            name={name}
            placeholder=" "
            value={value}
            onChange={(e) => onChange(e.target)}
            className={error ? 'error' : ''}
            required
          />
        )}
        <label htmlFor={name} className={error ? 'error' : ''}>
          {i18n._(label)}*
        </label>
        {error && <ErrorText>{error}</ErrorText>}
      </Row>
    </>
  )
}
