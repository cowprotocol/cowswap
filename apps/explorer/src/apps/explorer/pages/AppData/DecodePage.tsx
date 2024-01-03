import React, { useEffect, useState } from 'react'
import Form, { FormValidation } from '@rjsf/core'
import { decodeAppDataSchema, FormProps, handleErrors, transformErrors } from './config'
import DecodeAppData from 'components/AppData/DecodeAppData'
import { TabData } from '.'

type DecodeProps = {
  tabData: TabData
  setTabData: React.Dispatch<React.SetStateAction<TabData>>
}

const DecodePage: React.FC<DecodeProps> = ({ tabData, setTabData }) => {
  const { decode } = tabData
  const [formData, setFormdata] = useState<FormProps>(decode.formData)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(decode.options.isSubmitted ?? false)
  const [disabled, setDisabled] = useState<boolean>(decode.options.disabled ?? true)
  const [invalidFormDataAttempted, setInvalidFormDataAttempted] = useState<boolean>(
    decode.options.invalidFormDataAttempted ?? false,
  )

  useEffect(() => {
    setTabData((prevState) => ({
      ...prevState,
      decode: {
        formData,
        options: {
          isSubmitted,
          disabled,
          invalidFormDataAttempted,
        },
      },
    }))
  }, [disabled, formData, invalidFormDataAttempted, isSubmitted, setTabData])

  const formRef = React.useRef<Form<FormProps>>(null)

  const onSubmit = async ({ formData }: FormProps): Promise<void> => {
    setFormdata(formData)
    setIsSubmitted(true)
  }

  const handleOnChange = ({ formData }: FormProps): void => {
    setFormdata(formData)
    if (isSubmitted) {
      setIsSubmitted(false)
    }
    if (JSON.stringify(formData) !== JSON.stringify({})) {
      setDisabled(false)
    }
  }

  const onError = (_: FormProps, errors: FormValidation): FormValidation => handleErrors(formRef, errors, setDisabled)

  return (
    <div className="main-container">
      <div className="info-header box">
        <p>
          The decode tool allows you to decode an <strong>appData</strong> hash into the corresponding stored JSON
          document, if any.
        </p>
        <p>
          <strong>Note:</strong> Not all hexes correspond to an IPFS file and even so it doesn’t guarantee that the file
          is following our defined JSON schema.
        </p>
      </div>
      <div className="decode-container">
        <div className="left-panel">
          <Form
            className="data-form"
            showErrorList={false}
            onChange={handleOnChange}
            formData={formData}
            ref={formRef}
            onSubmit={onSubmit}
            transformErrors={transformErrors}
            liveValidate={invalidFormDataAttempted}
            noHtml5Validate
            validate={onError}
            onError={(): void => setInvalidFormDataAttempted(true)}
            schema={decodeAppDataSchema}
          >
            <button className="btn btn-info" disabled={disabled} type="submit">
              DECODE APPDATA
            </button>
          </Form>
        </div>
        {isSubmitted && (
          <div className="decode-section">
            <DecodeAppData showExpanded appData={formData?.appData} />
          </div>
        )}
      </div>
    </div>
  )
}

export default DecodePage
