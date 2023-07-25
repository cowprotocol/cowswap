export type UploadAppDataDoc = (appDataDoc: string) => Promise<string>

export const uploadAppDataDocOrderbookApi: UploadAppDataDoc = async (appDataDoc) => {
  // TODO: Implement logic to post the doc to the orderbook API
  // https://cowservices.slack.com/archives/C0375NV72SC/p1690300109648539?thread_ts=1690297997.334099&cid=C0375NV72SC
  console.log('POST api.cow.fi/v1/app_datas, with content', appDataDoc)

  return ''
}
