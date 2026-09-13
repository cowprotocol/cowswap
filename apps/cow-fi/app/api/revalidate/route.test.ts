import {
  CMS_REVALIDATE_ROUTES,
  getUnauthorizedRevalidateResponse,
  handleRevalidatePost,
} from '../../../util/cmsRevalidate'

const TEST_SECRET = 'test-revalidate-secret'

function createRevalidateMocks(): {
  revalidatePath: jest.Mock
  revalidateTag: jest.Mock
} {
  return {
    revalidatePath: jest.fn(),
    revalidateTag: jest.fn(),
  }
}

describe('authenticated resource revalidation', () => {
  it('returns 500 when the revalidation secret is not configured', () => {
    const { revalidatePath, revalidateTag } = createRevalidateMocks()

    expect(
      handleRevalidatePost({
        body: { path: '/resources/tokens/example' },
        configuredSecret: undefined,
        providedSecret: TEST_SECRET,
        revalidatePath,
        revalidateTag,
      }),
    ).toEqual({
      status: 500,
      body: { message: 'Revalidation not configured properly' },
    })
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('rejects missing or invalid secrets before touching cache', () => {
    const { revalidatePath, revalidateTag } = createRevalidateMocks()

    expect(
      handleRevalidatePost({
        body: { path: '/resources/tokens/example' },
        configuredSecret: TEST_SECRET,
        providedSecret: null,
        revalidatePath,
        revalidateTag,
      }).status,
    ).toBe(401)
    expect(
      handleRevalidatePost({
        body: { path: '/resources/tokens/example' },
        configuredSecret: TEST_SECRET,
        providedSecret: 'wrong',
        revalidatePath,
        revalidateTag,
      }).status,
    ).toBe(401)
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('revalidates an authenticated resource detail payload', () => {
    const { revalidatePath, revalidateTag } = createRevalidateMocks()
    const result = handleRevalidatePost({
      body: { path: '/resources/tokens/example', tag: 'cms-content' },
      configuredSecret: TEST_SECRET,
      providedSecret: TEST_SECRET,
      revalidatePath,
      revalidateTag,
    })

    expect(result.status).toBe(200)
    expect(result.body.revalidated).toBe(true)
    expect(result.body.message).toContain('/resources/tokens/example')
    expect(revalidateTag).toHaveBeenCalledWith('cms-content')
    expect(revalidatePath).toHaveBeenCalledWith('/resources/[campaign]', 'page')
    expect(revalidatePath).toHaveBeenCalledWith('/resources/[campaign]/[slug]', 'page')
    expect(revalidatePath).toHaveBeenCalledWith('/resources/tokens/example')
  })

  it('revalidates authenticated resource hub and campaign payloads', () => {
    const { revalidatePath, revalidateTag } = createRevalidateMocks()

    expect(
      handleRevalidatePost({
        body: { path: '/resources' },
        configuredSecret: TEST_SECRET,
        providedSecret: TEST_SECRET,
        revalidatePath,
        revalidateTag,
      }).status,
    ).toBe(200)
    expect(
      handleRevalidatePost({
        body: { path: '/resources/tokens' },
        configuredSecret: TEST_SECRET,
        providedSecret: TEST_SECRET,
        revalidatePath,
        revalidateTag,
      }).status,
    ).toBe(200)
    expect(revalidatePath).toHaveBeenCalledWith('/resources')
    expect(revalidatePath).toHaveBeenCalledWith('/resources/tokens')
  })

  it('still accepts authenticated learn payloads', () => {
    const { revalidatePath, revalidateTag } = createRevalidateMocks()
    const result = handleRevalidatePost({
      body: { path: 'learn/topic/amm' },
      configuredSecret: TEST_SECRET,
      providedSecret: TEST_SECRET,
      revalidatePath,
      revalidateTag,
    })

    expect(result.status).toBe(200)
    expect(revalidatePath).toHaveBeenCalledWith('/learn/topic/amm')
    expect(revalidatePath).toHaveBeenCalledWith('/learn/[article]', 'page')
  })

  it('accepts a constructor campaign because it is a valid CMS slug', () => {
    const { revalidatePath, revalidateTag } = createRevalidateMocks()
    const result = handleRevalidatePost({
      body: { path: '/resources/constructor/example' },
      configuredSecret: TEST_SECRET,
      providedSecret: TEST_SECRET,
      revalidatePath,
      revalidateTag,
    })

    expect(result.status).toBe(200)
    expect(revalidatePath).toHaveBeenCalledWith('/resources/constructor/example')
  })

  it('rejects resource paths that fall outside the CMS slug allowlist', () => {
    const { revalidatePath, revalidateTag } = createRevalidateMocks()
    const result = handleRevalidatePost({
      body: { path: '/resources/../admin' },
      configuredSecret: TEST_SECRET,
      providedSecret: TEST_SECRET,
      revalidatePath,
      revalidateTag,
    })

    expect(result).toEqual({
      status: 400,
      body: {
        message: 'Error revalidating',
        error: 'Unsupported revalidation path "/resources/../admin"',
      },
    })
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('passes page type for dynamic learn and resource routes', () => {
    const dynamicRoutes = CMS_REVALIDATE_ROUTES.filter((route) => route.path.includes('['))

    expect(dynamicRoutes).toEqual([
      { path: '/learn/[article]', type: 'page' },
      { path: '/resources/[campaign]', type: 'page' },
      { path: '/resources/[campaign]/[slug]', type: 'page' },
    ])
  })

  it('rejects unauthorized requests without requiring a parsed body', () => {
    expect(getUnauthorizedRevalidateResponse(undefined, TEST_SECRET)).toEqual({
      status: 500,
      body: { message: 'Revalidation not configured properly' },
    })
    expect(getUnauthorizedRevalidateResponse(TEST_SECRET, null)).toEqual({
      status: 401,
      body: { message: 'Invalid secret' },
    })
    expect(getUnauthorizedRevalidateResponse(TEST_SECRET, TEST_SECRET)).toBeNull()
  })
})
