import React, { useCallback, useEffect, useState } from 'react'
import Form, { FormValidation } from '@rjsf/core'
import { JSONSchema7 } from 'json-schema'
import { IpfsHashInfo, stringifyDeterministic } from '@cowprotocol/app-data'

import { RowWithCopyButton } from 'components/common/RowWithCopyButton'

import AppDataWrapper from 'components/common/AppDataWrapper'

import {
  CustomField,
  FormProps,
  getSchema,
  handleErrors,
  INITIAL_FORM_VALUES,
  transformErrors,
  uiSchema,
} from './config'
import { TabData } from '.'
import { metadataApiSDK } from 'cowSdk'

type EncodeProps = {
  tabData: TabData
  setTabData: React.Dispatch<React.SetStateAction<TabData>>
  handleTabChange: (tabId: number) => void
}
type FullAppData = { fullAppData: string; fullAppDataPrettified: string; isValidAppData: boolean }

const EncodePage: React.FC<EncodeProps> = ({ tabData, setTabData /* handleTabChange */ }) => {
  const { encode } = tabData
  const [schema, setSchema] = useState<JSONSchema7>(encode.options.schema ?? {})
  const [appDataForm, setAppDataForm] = useState(encode.formData)
  const [{ fullAppData, fullAppDataPrettified, isValidAppData }, setFullAppData] = useState<FullAppData>({
    fullAppData: '',
    fullAppDataPrettified: '',
    isValidAppData: false,
  })
  const [disabledAppData, setDisabledAppData] = useState<boolean>(encode.options.disabledAppData ?? true)
  const [disabledIPFS /* setDisabledIPFS*/] = useState<boolean>(encode.options.disabledIPFS ?? true)
  const [invalidFormDataAttempted, setInvalidFormDataAttempted] = useState<{ appData: boolean; ipfs: boolean }>(
    encode.options.invalidFormDataAttempted ?? {
      appData: false,
      ipfs: false,
    },
  )
  const [isLoading, setIsLoading] = useState<boolean>(encode.options.isLoading ?? false)
  const [ipfsHashInfo, setIpfsHashInfo] = useState<IpfsHashInfo | void | undefined>(encode.options.ipfsHashInfo)
  const [ipfsCredentials /* setIpfsCredentials */] = useState<{ pinataApiKey?: string; pinataApiSecret?: string }>(
    encode.options.ipfsCredentials ?? {},
  )
  const [isDocUploaded, setIsDocUploaded] = useState<boolean>(encode.options.isDocUploaded ?? false)
  const [error, setError] = useState<string | undefined>(encode.options.error)
  const formRef = React.useRef<Form<FormProps>>(null)

  useEffect(() => {
    const fetchSchema = async (): Promise<void> => {
      const latestSchema = await getSchema()
      setSchema(latestSchema)
      setAppDataForm(INITIAL_FORM_VALUES)
    }

    if (!Object.keys(schema).length) {
      fetchSchema()
    }
  }, [schema])

  useEffect(() => {
    setTabData((prevState) => ({
      ...prevState,
      encode: {
        formData: appDataForm,
        options: {
          schema,
          disabledAppData,
          disabledIPFS,
          invalidFormDataAttempted,
          isLoading,
          ipfsHashInfo,
          ipfsCredentials,
          isDocUploaded,
          error,
        },
      },
    }))
  }, [
    appDataForm,
    disabledAppData,
    disabledIPFS,
    error,
    invalidFormDataAttempted,
    ipfsCredentials,
    ipfsHashInfo,
    isDocUploaded,
    isLoading,
    schema,
    setTabData,
  ])

  useEffect(() => {
    _toFullAppData(appDataForm).then(setFullAppData)
  }, [appDataForm])

  useEffect(() => {
    setIsLoading(true)

    // Get the fullAppData (dermenistic stringify JSON)
    _toFullAppData(appDataForm)
      .then((fullAppData) => {
        // Update the fullAppData
        setFullAppData(fullAppData)

        // Get the IPFS hash
        return metadataApiSDK.appDataToCid(fullAppData.fullAppData)
      })
      // Update CID
      .then(setIpfsHashInfo)
      .catch((e) => {
        console.error('Error updating the IPFS Hash info (CID, hex)', e)
        setError(e.message)
      })
      .finally(() => {
        setIsLoading(false)
        toggleInvalid({ appData: true })
      })
  }, [appDataForm])

  const toggleInvalid = (data: { [key: string]: boolean }): void => {
    setInvalidFormDataAttempted((prevState) => ({ ...prevState, ...data }))
  }

  const handleMetadataErrors = useCallback(
    (_: FormProps, errors: FormValidation): FormValidation => handleErrors(formRef, errors, setDisabledAppData),
    [],
  )

  // const handleIPFSErrors = useCallback(
  //   (_: FormProps, errors: FormValidation): FormValidation => handleErrors(ipfsFormRef, errors, setDisabledIPFS),
  //   [],
  // )

  const handleOnChange = useCallback(
    ({ formData }: FormProps): void => {
      const resetFormFields = (form: string): void => {
        toggleInvalid({ ipfs: false })
        if (form === 'appData') {
          setDisabledAppData(true)
        }
      }
      setAppDataForm(formData)
      if (ipfsHashInfo) {
        setIpfsHashInfo(undefined)
        setIsDocUploaded(false)
        resetFormFields('appData')
        setError(undefined)
      }
    },
    [ipfsHashInfo],
  )

  // const handleIPFSOnChange = useCallback(({ formData: ipfsData }: FormProps): void => {
  //   setIpfsCredentials(ipfsData)
  //   if (JSON.stringify(ipfsData) !== JSON.stringify({})) {
  //     setDisabledIPFS(false)
  //   }
  // }, [])

  // const onUploadToIPFS = useCallback(
  //   async ({ formData }: FormProps): Promise<void> => {
  //     if (!ipfsHashInfo) return
  //     setIsLoading(true)
  //     try {
  //       await metadataApiSDK.uploadMetadataDocToIpfsLegacy(handleFormatData(appDataForm), formData)
  //       setIsDocUploaded(true)
  //     } catch (e) {
  //       if (INVALID_IPFS_CREDENTIALS.includes(e.message)) {
  //         e.message = 'Invalid API keys provided.'
  //       }
  //       setError(e.message)
  //       setIsDocUploaded(false)
  //     } finally {
  //       setIsLoading(false)
  //       toggleInvalid({ ipfs: true })
  //     }
  //   },
  //   [appDataForm, ipfsHashInfo],
  // )

  return (
    <>
      <div className="info-header box">
        <p>
          The{' '}
          <a
            href="https://github.com/cowprotocol/contracts/blob/main/src/contracts/libraries/GPv2Order.sol#L18"
            target="_blank"
            rel="noreferrer"
          >
            AppData hex
          </a>
          is an optional field part of CoW Protocol orders. It allows users/dapps/wallets to attach meta-information to
          orders. This is useful for giving context to your orders, like crediting the order to a specific UI, adding
          affiliate information, or even signalling your order should be treated in a special way.
        </p>
        <p>This field is the hexadecimal digest of a JSON file.</p>
        <p>
          The JSON file follows a
          <a target="_blank" href="https://json-schema.org" rel="noreferrer">
            JSON schema
          </a>
          defined on app-data
          <a target="_blank" href="https://github.com/cowprotocol/app-data" rel="noreferrer">
            repo.
          </a>
        </p>
      </div>
      <div className="form-container">
        <Form
          className="data-form"
          liveOmit
          liveValidate={invalidFormDataAttempted.appData}
          omitExtraData
          showErrorList={false}
          fields={{ cField: CustomField }}
          noHtml5Validate
          onChange={handleOnChange}
          formData={appDataForm}
          validate={handleMetadataErrors}
          transformErrors={transformErrors}
          ref={formRef}
          autoComplete="off"
          onError={(): void => toggleInvalid({ appData: true })}
          schema={schema}
          uiSchema={uiSchema}
        >
          <></>
        </Form>
        <AppDataWrapper>
          <div className="hidden-content">
            <h2>💅 AppData prettified</h2>
            <p>
              This is the generated and <strong>prettified</strong> file based on the input you provided on the form.
            </p>
            <p>This content is for illustration purposes, see below.</p>
            <JsonContent content={fullAppDataPrettified} isError={!isValidAppData} />
            {fullAppData && (
              <>
                <h2>ℹ️ AppData string</h2>
                <p>
                  This is the actual content that is hashed using <code>keccak-256</code> to get the{' '}
                  <strong>AppData hex</strong>.
                </p>
                <p>
                  This UI formats the provided info using a{' '}
                  <a href="https://www.npmjs.com/package/json-stringify-deterministic" target="_blank" rel="noreferrer">
                    deterministic JSON formatter
                  </a>{' '}
                  , this way the same content yields always the same <strong>AppData hex</strong>.
                </p>
                <JsonContent content={fullAppData} isError={!isValidAppData} />
                <p className="disclaimer">Note: Don’t forget to upload this file to IPFS!</p>
              </>
            )}
            {ipfsHashInfo && (
              <>
                <h2>🐮 AppData hex</h2>
                <p>
                  This is the <code>keccak-256</code> hash of the above document represented in hexadecimal format.
                </p>
                <p>
                  Use this in your{' '}
                  <a
                    href="https://github.com/cowprotocol/contracts/blob/main/src/contracts/libraries/GPv2Order.sol#L18"
                    target="_blank"
                    rel="noreferrer"
                  >
                    CoW Orders appData field
                  </a>{' '}
                  .
                </p>
                <RowWithCopyButton
                  className="appData-hash"
                  textToCopy={ipfsHashInfo.appDataHex}
                  contentsToDisplay={ipfsHashInfo.appDataHex}
                />
                <h2>🌍 IPFS CiD</h2>
                <p>
                  This is the{' '}
                  <a href="https://docs.ipfs.tech/concepts/content-addressing/" target="_blank" rel="noreferrer">
                    IPFS CID
                  </a>
                  .
                </p>
                <p>
                  This CID is derived from the <strong>AppData hex</strong> (
                  <a
                    href="https://github.com/cowprotocol/app-data/blob/main/src/api/appDataHexToCid.ts#L30"
                    target="_blank"
                    rel="noreferrer"
                  >
                    see here how
                  </a>
                  ). You can see how this <strong>AppData hex</strong> is encoded, using the{' '}
                  <a href={'https://cid.ipfs.tech/#' + ipfsHashInfo.cid} target="_blank" rel="noreferrer">
                    CID Inspector
                  </a>
                  .
                </p>
                <p>
                  What this means is that you can derived the IPFS CID from on-chain CoW Orders, and download the JSON
                  from IPFS network to see the meta-information of that order.
                </p>
                <RowWithCopyButton
                  className="appData-hash"
                  textToCopy={ipfsHashInfo.cid}
                  contentsToDisplay={ipfsHashInfo.cid}
                />
              </>
            )}
          </div>
        </AppDataWrapper>
      </div>
      {/* <div className="ipfs-container">
        {ipfsHashInfo && (
          <>
            <IpfsWrapper>
              <div className="info-header inner-form">
                <h2>IPFS UPLOAD</h2>
                <p>
                  We offer an integrated way to upload the generated file to IPFS directly through
                  <a target="_blank" href="https://docs.pinata.cloud/pinata-api" rel="noreferrer">
                    Pinata’s
                  </a>
                  API.
                </p>
                <p>
                  Insert your credentials and hit upload. The resulting <strong>appData</strong> hash is displayed on
                  the generated section.
                </p>
                <p>
                  Once uploaded, you can use the <strong>appData</strong> hash in the
                  <a onClick={(): void => handleTabChange(TabView.DECODE)}>Decode</a>
                  tab to verify it.
                </p>
              </div>
              <Form
                className="data-form"
                showErrorList={false}
                onSubmit={onUploadToIPFS}
                liveValidate={invalidFormDataAttempted.ipfs}
                onChange={handleIPFSOnChange}
                formData={ipfsCredentials}
                validate={handleIPFSErrors}
                fields={{ cField: CustomField }}
                ref={ipfsFormRef}
                noHtml5Validate
                onError={(): void => toggleInvalid({ ipfs: true })}
                transformErrors={transformErrors}
                schema={ipfsSchema}
                uiSchema={ipfsUiSchema}
              >
                <span className="disclaimer">
                  <strong>Notes:</strong>
                  <ol>
                    <li>
                      The credentials are kept in memory only while you are at this page. When you navigate away or
                      close the browser tab it’ll be cleared.
                    </li>
                    <li>
                      If you upload the file directly, the resulting hash/appDataHash might differ. The hash/IPFS CID
                      calculated by the tool is a minified and stringified file without a new line at the end. That
                      means that you will get different results if the file is uploaded directly as a file.
                    </li>
                  </ol>
                </span>
                <button className="btn btn-info" disabled={disabledIPFS} type="submit">
                  UPLOAD APPDATA TO IPFS
                </button>
              </Form>
            </IpfsWrapper>
          </>
        )}
        {isDocUploaded && (
          <>
            <RowWithCopyButton
              className="appData-hash"
              textToCopy={`${DEFAULT_IPFS_READ_URI}/${ipfsHashInfo?.cid}`}
              contentsToDisplay={
                <a href={`${DEFAULT_IPFS_READ_URI}/${ipfsHashInfo?.cid}`} target="_blank" rel="noopener noreferrer">
                  {ipfsHashInfo?.cid}
                </a>
              }
            />
            <Notification
              type="success"
              message="Document uploaded successfully!"
              closable={false}
              appendMessage={false}
            />
          </>
        )}
        {isLoading && <Spinner />}
        {error && !isDocUploaded && (
          <Notification type="error" message={error} closable={false} appendMessage={false} />
        )}
      </div>
      */}
    </>
  )
}

function JsonContent({ content, isError }: { content: string; isError: boolean }): JSX.Element {
  return (
    <>
      <RowWithCopyButton
        textToCopy={content}
        contentsToDisplay={<pre className={(isError ? 'error ' : '') + 'json-formatter'}>{content}</pre>}
      />
      {isError && <span className="error">The AppData content is not valid, check the errors in the input form.</span>}
    </>
  )
}

async function _toFullAppData(formData: FormProps): Promise<FullAppData> {
  const doc = await metadataApiSDK.generateAppDataDoc(formData)

  // Cleanup doc (remove undefined props since it messess up with the validation)
  const metadata = doc.metadata
  Object.keys(metadata).forEach((key) => {
    const meta = metadata[key]
    Object.keys(meta).forEach((k) => {
      if (!meta[k]) {
        delete meta[k]
      }
    })
    if (!meta || Object.keys(meta).length === 0) {
      delete metadata[key]
    }
  })

  return {
    fullAppData: await stringifyDeterministic(doc), // deterministic string
    fullAppDataPrettified: JSON.stringify(doc, null, 2), // prettified string
    isValidAppData: await metadataApiSDK.validateAppDataDoc(doc).then((result) => result.success),
  }
}

export default EncodePage
