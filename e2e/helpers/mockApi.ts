import { Page, Route } from '@playwright/test';

export type MockApiResponse = {
  status: number;
  body: Record<string, unknown>;
};

/**
 * Intercepts POST /api/createEvent and responds with the given status + body.
 * Call this before page.goto() or at any point before the form is submitted.
 */
export async function mockCreateEvent(
  page: Page,
  response: MockApiResponse
): Promise<void> {
  await page.route('**/api/createEvent', async (route: Route) => {
    await route.fulfill({
      status: response.status,
      contentType: 'application/json',
      body: JSON.stringify(response.body),
    });
  });
}

/** Convenience: successful 201 response with a fake pageId */
export async function mockCreateEventSuccess(
  page: Page,
  pageId = 'test-page-id-abc123'
): Promise<void> {
  await mockCreateEvent(page, {
    status: 201,
    body: {
      message: 'Event created successfully',
      pageId,
      emailSent: true,
    },
  });
}

/** Convenience: server-side 500 error */
export async function mockCreateEventError(
  page: Page,
  message = 'Internal server error'
): Promise<void> {
  await mockCreateEvent(page, {
    status: 500,
    body: { error: message },
  });
}
