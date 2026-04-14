/**
 * booking-submission.spec.ts
 *
 * Tests the form submission outcomes:
 *
 * 1. Successful submission (API 201) → ThankYou screen with first name + pageId
 * 2. API error (500) → SubmissionError screen with error heading
 * 3. "Try Again" on SubmissionError → returns to Step 6 Review
 * 4. reCAPTCHA throws → SubmissionError shown, API never called
 * 5. Loading spinner appears between submit click and response
 */

import { test, expect } from '@playwright/test';
import { stubRecaptcha } from './helpers/stubRecaptcha';
import { mockCreateEventSuccess, mockCreateEventError } from './helpers/mockApi';
import { BookingPage } from './helpers/BookingPage';

/** Fully fills all 6 steps and checks TOS, leaving the form ready to submit. */
async function fillEverythingAndCheckTOS(booking: BookingPage) {
  await booking.fillStep1({ firstName: 'Jane' });
  await booking.clickNext();
  await booking.fillStep2();
  await booking.clickNext();
  await booking.selectPackage('Dream');
  await booking.clickNext();
  await booking.selectNumCharacters('1');
  await booking.selectCharacter('Ice Queen');
  await booking.clickNext();
  await booking.fillStep5Birthday();
  await booking.clickNext();
  await booking.checkTOS();
}

test.describe('Submission: success → ThankYou', () => {
  test('Shows ThankYou screen with first name on 201 response', async ({ page }) => {
    await stubRecaptcha(page);
    await mockCreateEventSuccess(page, 'notion-page-abc');
    const booking = new BookingPage(page);
    await booking.goto();

    await fillEverythingAndCheckTOS(booking);
    await booking.clickSendRequest();
    await booking.waitForThankYou();

    await expect(page.locator('h1:has-text("Thank You, Jane")')).toBeVisible();
    await expect(
      page.locator('text=Your event request has been submitted successfully')
    ).toBeVisible();
  });

  test('ThankYou screen shows next-steps list', async ({ page }) => {
    await stubRecaptcha(page);
    await mockCreateEventSuccess(page);
    const booking = new BookingPage(page);
    await booking.goto();

    await fillEverythingAndCheckTOS(booking);
    await booking.clickSendRequest();
    await booking.waitForThankYou();

    await expect(page.locator('text=72 hours')).toBeVisible();
  });

  test('POST /api/createEvent is called exactly once on submit', async ({ page }) => {
    await stubRecaptcha(page);

    let callCount = 0;
    await page.route('**/api/createEvent', async (route) => {
      callCount++;
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'ok', pageId: 'x', emailSent: true }),
      });
    });

    const booking = new BookingPage(page);
    await booking.goto();
    await fillEverythingAndCheckTOS(booking);
    await booking.clickSendRequest();
    await booking.waitForThankYou();

    expect(callCount).toBe(1);
  });
});

test.describe('Submission: API error → SubmissionError', () => {
  test('Shows SubmissionError screen on 500 response', async ({ page }) => {
    await stubRecaptcha(page);
    await mockCreateEventError(page, 'Internal server error');
    const booking = new BookingPage(page);
    await booking.goto();

    await fillEverythingAndCheckTOS(booking);
    await booking.clickSendRequest();
    await booking.waitForSubmissionError();

    await expect(page.locator('h1:has-text("Oops")')).toBeVisible();
    // Error message from BookClient: "Something went wrong. Please try again."
    await expect(
      page.locator('text=Something went wrong. Please try again.')
    ).toBeVisible();
  });

  test('"Try Again" button returns to Step 6 Review', async ({ page }) => {
    await stubRecaptcha(page);
    await mockCreateEventError(page);
    const booking = new BookingPage(page);
    await booking.goto();

    await fillEverythingAndCheckTOS(booking);
    await booking.clickSendRequest();
    await booking.waitForSubmissionError();

    // Click Try Again
    await page.locator('button:has-text("Try Again")').click();

    // Should be back at Step 6 with TOS checkbox visible
    await expect(page.locator('#agreeToTOS')).toBeVisible();
    await expect(page.locator('p:has-text("Send Request")')).toBeVisible();
  });

  test('"Try Again" allows a second submission attempt', async ({ page }) => {
    await stubRecaptcha(page);

    // First call: error; second call: success
    let callCount = 0;
    await page.route('**/api/createEvent', async (route) => {
      callCount++;
      if (callCount === 1) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Temporary failure' }),
        });
      } else {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'ok', pageId: 'retry-page-id', emailSent: true }),
        });
      }
    });

    const booking = new BookingPage(page);
    await booking.goto();
    await fillEverythingAndCheckTOS(booking);
    await booking.clickSendRequest();
    await booking.waitForSubmissionError();

    // Retry
    await page.locator('button:has-text("Try Again")').click();
    await page.locator('#agreeToTOS').check();
    await booking.clickSendRequest();
    await booking.waitForThankYou();

    expect(callCount).toBe(2);
    await expect(page.locator('h1:has-text("Thank You, Jane")')).toBeVisible();
  });
});

test.describe('Submission: reCAPTCHA failure', () => {
  test('Shows SubmissionError when grecaptcha.execute throws', async ({ page }) => {
    // Override: make execute throw after the stub is in place
    await page.addInitScript(() => {
      (window as any).grecaptcha = {
        ready: (cb: () => void) => cb(),
        execute: () => Promise.reject(new Error('reCAPTCHA network error')),
      };
    });

    // Still need to set the site key so the hook doesn't bail early
    await page.addInitScript(() => {
      // Provide a truthy site key via the env var path
      (window as any).__NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY__ = 'test-site-key';
    });

    let apiCalled = false;
    await page.route('**/api/createEvent', async (route) => {
      apiCalled = true;
      await route.fulfill({ status: 201, body: '{}' });
    });

    const booking = new BookingPage(page);
    await booking.goto();
    await fillEverythingAndCheckTOS(booking);
    await booking.clickSendRequest();
    await booking.waitForSubmissionError();

    // API must never have been called
    expect(apiCalled).toBe(false);
    await expect(page.locator('h1:has-text("Oops")')).toBeVisible();
  });

  test('Shows SubmissionError when grecaptcha.execute returns null', async ({ page }) => {
    // Stub returns null (site key present, but token generation fails)
    await page.addInitScript(() => {
      (window as any).grecaptcha = {
        ready: (cb: () => void) => cb(),
        execute: () => Promise.resolve(null),
      };
      (window as any).__NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY__ = 'test-site-key';
    });

    let apiCalled = false;
    await page.route('**/api/createEvent', async (route) => {
      apiCalled = true;
      await route.fulfill({ status: 201, body: '{}' });
    });

    const booking = new BookingPage(page);
    await booking.goto();
    await fillEverythingAndCheckTOS(booking);
    await booking.clickSendRequest();
    await booking.waitForSubmissionError();

    expect(apiCalled).toBe(false);
  });
});

test.describe('Submission: loading state', () => {
  test('Loading spinner is shown while the API request is in-flight', async ({ page }) => {
    await stubRecaptcha(page);

    // Use a slow route so we can assert the spinner is visible
    await page.route('**/api/createEvent', async (route) => {
      await page.waitForTimeout(1500);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'ok', pageId: 'slow-page-id', emailSent: true }),
      });
    });

    const booking = new BookingPage(page);
    await booking.goto();
    await fillEverythingAndCheckTOS(booking);

    // Click submit — don't await the full response yet
    const submitPromise = booking.clickSendRequest();

    // Spinner and loading text should appear during the wait
    await expect(page.locator('text=Sending your request...')).toBeVisible({ timeout: 3000 });

    // Wait for it to complete
    await submitPromise;
    await booking.waitForThankYou();
  });
});
