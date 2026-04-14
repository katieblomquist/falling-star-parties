/**
 * booking-birthday.spec.ts
 *
 * Full end-to-end happy path for a Birthday Party booking.
 * Covers all 6 steps from form entry to the Thank You screen.
 *
 * The POST /api/createEvent endpoint is mocked so no real Notion / email
 * traffic is generated. reCAPTCHA v3 is stubbed via addInitScript.
 */

import { test, expect } from '@playwright/test';
import { stubRecaptcha } from './helpers/stubRecaptcha';
import { mockCreateEventSuccess } from './helpers/mockApi';
import { BookingPage } from './helpers/BookingPage';

const PAGE_ID = 'birthday-test-page-id';

test.describe('Birthday Party — full booking flow', () => {
  let booking: BookingPage;

  test.beforeEach(async ({ page }) => {
    await stubRecaptcha(page);
    await mockCreateEventSuccess(page, PAGE_ID);
    booking = new BookingPage(page);
    await booking.goto();
  });

  // --------------------------------------------------------------------------
  // Step 1 — Your Information
  // --------------------------------------------------------------------------

  test('Step 1: Next button is disabled until all fields are filled', async () => {
    // Initially disabled
    expect(await booking.isNextEnabled()).toBe(false);

    await booking.fillFirstName('Jane');
    expect(await booking.isNextEnabled()).toBe(false);

    await booking.fillLastName('Doe');
    await booking.fillEmail('jane@example.com');
    await booking.fillPhone('555-867-5309');
    // Still need event type
    expect(await booking.isNextEnabled()).toBe(false);

    await booking.selectEventType('Birthday Party');
    expect(await booking.isNextEnabled()).toBe(true);
  });

  test('Step 1 → Step 2: advances after completing information', async () => {
    await booking.fillStep1({ eventType: 'Birthday Party' });
    await booking.clickNext();

    // Step 2 heading should now be visible and active
    await expect(booking.page.locator('h4:has-text("Date")')).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // Step 2 — Time & Location
  // --------------------------------------------------------------------------

  test('Step 2 → Step 3: advances after completing time & location', async () => {
    await booking.fillStep1();
    await booking.clickNext();

    await booking.fillStep2();
    await booking.clickNext();

    // Step 3 heading
    await expect(
      booking.page.locator('h3:has-text("Select Your Event Package")')
    ).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // Step 3 — Event Options
  // --------------------------------------------------------------------------

  test('Step 3 → Step 4: selects Birthday Party package and advances', async () => {
    await booking.fillStep1();
    await booking.clickNext();
    await booking.fillStep2();
    await booking.clickNext();

    // Select the "Dream" birthday party package
    await booking.selectPackage('Dream');

    // Also add an extra (optional — but exercises the extras UI)
    await booking.selectExtra('Storybook Keepsake');

    await booking.clickNext();

    await expect(
      booking.page.locator('h3:has-text("Select Your Preferred Character")')
    ).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // Step 4 — Characters
  // --------------------------------------------------------------------------

  test('Step 4 → Step 5: selects 1 character and advances', async () => {
    await booking.fillStep1();
    await booking.clickNext();
    await booking.fillStep2();
    await booking.clickNext();
    await booking.selectPackage('Dream');
    await booking.clickNext();

    await booking.selectNumCharacters('1');
    await booking.selectCharacter('Ice Queen');

    await booking.clickNext();

    await expect(
      booking.page.locator("h3:has-text(\"Child's Name and Age\")")
    ).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // Step 5 — Event Details (Birthday)
  // --------------------------------------------------------------------------

  test('Step 5 → Step 6: fills birthday event details and advances', async () => {
    await booking.fillStep1();
    await booking.clickNext();
    await booking.fillStep2();
    await booking.clickNext();
    await booking.selectPackage('Dream');
    await booking.clickNext();
    await booking.selectNumCharacters('1');
    await booking.selectCharacter('Ice Queen');
    await booking.clickNext();

    await booking.fillStep5Birthday({
      childName: 'Lily',
      childAge: '7',
      attendance: '15',
      locationPref: 'Indoor',
      photoPref: 'Yes',
    });

    await booking.clickNext();

    // Step 6 — Review
    await expect(booking.page.locator('h3:has-text("Contact Info for Jane")')).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // Step 6 — Review Request + Submission
  // --------------------------------------------------------------------------

  test('Step 6: Send Request is disabled without TOS agreement', async () => {
    await booking.fillStep1();
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

    // TOS not checked yet
    expect(await booking.isSendRequestEnabled()).toBe(false);
  });

  test('Step 6: review summary shows entered data correctly', async () => {
    await booking.fillStep1({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phone: '555-867-5309',
      eventType: 'Birthday Party',
    });
    await booking.clickNext();
    await booking.fillStep2();
    await booking.clickNext();
    await booking.selectPackage('Dream');
    await booking.clickNext();
    await booking.selectNumCharacters('1');
    await booking.selectCharacter('Ice Queen');
    await booking.clickNext();
    await booking.fillStep5Birthday({ childName: 'Lily', childAge: '7' });
    await booking.clickNext();

    // Check summary content
    await expect(booking.page.locator('text=Jane Doe')).toBeVisible();
    await expect(booking.page.locator('text=jane@example.com')).toBeVisible();
    await expect(booking.page.locator('text=Ice Queen')).toBeVisible();
    await expect(booking.page.locator('text=Dream')).toBeVisible();
    await expect(booking.page.locator('text=Lily')).toBeVisible();
  });

  test('Full birthday flow: submits and shows Thank You screen', async () => {
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
    expect(await booking.isSendRequestEnabled()).toBe(true);

    await booking.clickSendRequest();
    await booking.waitForThankYou();

    await expect(booking.page.locator('h1:has-text("Thank You, Jane")')).toBeVisible();
    await expect(
      booking.page.locator('text=Your event request has been submitted successfully')
    ).toBeVisible();
  });
});
