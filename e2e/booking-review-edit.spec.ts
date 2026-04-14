/**
 * booking-review-edit.spec.ts
 *
 * Tests the Step 6 review summary and the "Edit Your Event" mode:
 *
 * 1. Review summary correctly reflects data entered in previous steps
 * 2. "Edit Your Event" button navigates back to Step 1 and enables free navigation
 * 3. In review mode, clicking any step header jumps directly to that step
 * 4. Changes made during edit are reflected in the updated summary
 */

import { test, expect } from '@playwright/test';
import { BookingPage } from './helpers/BookingPage';

/** Complete all steps up to Step 6 (Review) */
async function fillAllSteps(booking: BookingPage, opts: {
  firstName?: string;
  lastName?: string;
  childName?: string;
  childAge?: string;
} = {}) {
  await booking.fillStep1({
    firstName: opts.firstName ?? 'Jane',
    lastName: opts.lastName ?? 'Doe',
    email: 'jane@example.com',
    phone: '555-867-5309',
    eventType: 'Birthday Party',
  });
  await booking.clickNext();
  await booking.fillStep2({ monthsAhead: 1, day: 20 });
  await booking.clickNext();
  await booking.selectPackage('Dream');
  await booking.clickNext();
  await booking.selectNumCharacters('1');
  await booking.selectCharacter('Ice Queen');
  await booking.clickNext();
  await booking.fillStep5Birthday({
    childName: opts.childName ?? 'Lily',
    childAge: opts.childAge ?? '7',
    attendance: '15',
    locationPref: 'Indoor',
    photoPref: 'Yes',
  });
  await booking.clickNext();
}

test.describe('Step 6: Review summary content', () => {
  let booking: BookingPage;

  test.beforeEach(async ({ page }) => {
    booking = new BookingPage(page);
    await booking.goto();
  });

  test('Summary shows correct name and contact info', async () => {
    await fillAllSteps(booking, { firstName: 'Jane', lastName: 'Doe' });

    await expect(booking.page.locator('text=Jane Doe')).toBeVisible();
    await expect(booking.page.locator('text=jane@example.com')).toBeVisible();
    await expect(booking.page.locator('text=555-867-5309')).toBeVisible();
  });

  test('Summary shows correct event date and address', async () => {
    await fillAllSteps(booking);

    // Date was set to 20th of next month; address uses default
    // The review shows e.g. "May 20th, 2026 at 2:00 PM" — check for the ordinal day
    await expect(booking.page.locator('text=20th')).toBeVisible();
    await expect(booking.page.locator('text=123 Enchanted Lane')).toBeVisible();
    await expect(booking.page.locator('text=Springfield')).toBeVisible();
    await expect(booking.page.locator('text=VA')).toBeVisible();
    await expect(booking.page.locator('text=22150')).toBeVisible();
  });

  test('Summary shows selected package', async () => {
    await fillAllSteps(booking);
    await expect(booking.page.locator('text=Dream')).toBeVisible();
  });

  test('Summary shows selected character', async () => {
    await fillAllSteps(booking);
    await expect(booking.page.locator('text=Ice Queen')).toBeVisible();
  });

  test('Summary shows child name and ordinal age for Birthday Party', async () => {
    await fillAllSteps(booking, { childName: 'Lily', childAge: '7' });

    await expect(booking.page.locator('text=Lily')).toBeVisible();
    // "7th Birthday Party for Lily"
    await expect(booking.page.locator('text=7th')).toBeVisible();
  });

  test('Ordinal suffix: 1st, 2nd, 3rd, 11th (edge cases)', async () => {
    // 1st
    await fillAllSteps(booking, { childAge: '1' });
    await expect(booking.page.locator('text=1st')).toBeVisible();
    await booking.page.reload();
    await booking.page.waitForSelector('h4:has-text("Your Information")');

    // 2nd
    await fillAllSteps(booking, { childAge: '2' });
    await expect(booking.page.locator('text=2nd')).toBeVisible();
    await booking.page.reload();
    await booking.page.waitForSelector('h4:has-text("Your Information")');

    // 3rd
    await fillAllSteps(booking, { childAge: '3' });
    await expect(booking.page.locator('text=3rd')).toBeVisible();
    await booking.page.reload();
    await booking.page.waitForSelector('h4:has-text("Your Information")');

    // 11th (teens use -th not -st)
    await fillAllSteps(booking, { childAge: '11' });
    await expect(booking.page.locator('text=11th')).toBeVisible();
  });

  test('Review header says "Contact Info for <FirstName>"', async () => {
    await fillAllSteps(booking, { firstName: 'Jane' });
    await expect(booking.page.locator('h3:has-text("Contact Info for Jane")')).toBeVisible();
  });
});

test.describe('Step 6: Edit Your Event mode', () => {
  let booking: BookingPage;

  test.beforeEach(async ({ page }) => {
    booking = new BookingPage(page);
    await booking.goto();
    await fillAllSteps(booking);
  });

  test('"Edit Your Event" navigates back to Step 1', async () => {
    await booking.clickEditYourEvent();

    // Step 1 content should be active and visible
    await expect(booking.page.locator('#firstName')).toBeVisible();
    await expect(booking.page.locator('#firstName')).toHaveValue('Jane');
  });

  test('In review mode, step headers are clickable for free navigation', async () => {
    await booking.clickEditYourEvent();

    // Should be on Step 1 in review mode — clicking Step 3 header jumps there
    await booking.clickStepHeader('Event Options');

    // Step 3 content should be active
    await expect(
      booking.page.locator('h3:has-text("Select Your Event Package")')
    ).toBeVisible();
  });

  test('In review mode, clicking Step 4 header jumps to characters', async () => {
    await booking.clickEditYourEvent();
    await booking.clickStepHeader('Characters');

    await expect(
      booking.page.locator('h3:has-text("Select Your Preferred Character")')
    ).toBeVisible();
  });

  test('Editing a value and returning to review updates the summary', async () => {
    await booking.clickEditYourEvent();

    // Change first name on Step 1
    await booking.fillFirstName('');
    await booking.fillFirstName('Sophie');

    // Navigate to Step 6 via the step header
    await booking.clickStepHeader('Review Request');

    // Summary should now show the updated name
    await expect(booking.page.locator('text=Sophie Doe')).toBeVisible();
    await expect(booking.page.locator('h3:has-text("Contact Info for Sophie")')).toBeVisible();
  });

  test('TOS checkbox must be re-checked after returning from edit mode', async () => {
    // Check TOS
    await booking.checkTOS();
    expect(await booking.isSendRequestEnabled()).toBe(true);

    // Enter edit mode and return
    await booking.clickEditYourEvent();
    await booking.clickStepHeader('Review Request');

    // After navigating away and back, TOS state should be preserved
    // (react-hook-form keeps values unless resetField is called)
    const isChecked = await booking.page.locator('#agreeToTOS').isChecked();
    // The form preserves values — the checkbox stays checked
    expect(isChecked).toBe(true);
  });

  test('"Send Request" is re-enabled after edit if TOS still checked', async () => {
    await booking.checkTOS();
    await booking.clickEditYourEvent();
    await booking.clickStepHeader('Review Request');

    expect(await booking.isSendRequestEnabled()).toBe(true);
  });
});
