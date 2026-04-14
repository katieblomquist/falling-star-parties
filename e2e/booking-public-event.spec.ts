/**
 * booking-public-event.spec.ts
 *
 * Full end-to-end happy path for a Public Event booking.
 *
 * Key differences from Birthday Party:
 *  - Step 3: only Public Event packages / extras are shown
 *  - Step 5: OrganizationName instead of ChildName + ChildAge
 *  - Review summary shows "<EventType> for <OrgName>"
 */

import { test, expect } from '@playwright/test';
import { stubRecaptcha } from './helpers/stubRecaptcha';
import { mockCreateEventSuccess } from './helpers/mockApi';
import { BookingPage } from './helpers/BookingPage';

test.describe('Public Event — full booking flow', () => {
  let booking: BookingPage;

  test.beforeEach(async ({ page }) => {
    await stubRecaptcha(page);
    await mockCreateEventSuccess(page, 'public-event-page-id');
    booking = new BookingPage(page);
    await booking.goto();
  });

  test('Step 1: selects Public Event type and advances', async () => {
    await booking.fillStep1({ eventType: 'Public Event' });
    expect(await booking.isNextEnabled()).toBe(true);
    await booking.clickNext();
    await expect(booking.page.locator('h4:has-text("Date")')).toBeVisible();
  });

  test('Step 3: shows only Public Event packages', async () => {
    await booking.fillStep1({ eventType: 'Public Event' });
    await booking.clickNext();
    await booking.fillStep2();
    await booking.clickNext();

    // Public Event package titles
    await expect(
      booking.page.locator('text=One Hour Meet and Greet - Starting at $250')
    ).toBeVisible();
    await expect(
      booking.page.locator('text=Two Hour Meet and Greet - Starting at $400')
    ).toBeVisible();

    // Birthday packages should NOT appear
    await expect(booking.page.locator('text=Dream - Starting at $200')).not.toBeVisible();
    await expect(booking.page.locator('text=Sparkle - Starting at $275')).not.toBeVisible();
  });

  test('Step 3: shows only Public Event extras', async () => {
    await booking.fillStep1({ eventType: 'Public Event' });
    await booking.clickNext();
    await booking.fillStep2();
    await booking.clickNext();

    await expect(booking.page.locator('text=Storytime - No additional charge!').first()).toBeVisible();
    await expect(booking.page.locator('text=Signature Cards')).toBeVisible();

    // Birthday-only extras must not appear
    await expect(booking.page.locator('text=Deluxe Princess Set')).not.toBeVisible();
  });

  test('Step 5: shows OrganizationName field (no ChildName/ChildAge)', async () => {
    await booking.fillStep1({ eventType: 'Public Event' });
    await booking.clickNext();
    await booking.fillStep2();
    await booking.clickNext();
    await booking.selectPackage('One Hour Meet and Greet');
    await booking.clickNext();
    await booking.selectNumCharacters('1');
    await booking.selectCharacter('Snow Princess');
    await booking.clickNext();

    await expect(booking.page.locator('#organizationName')).toBeVisible();
    await expect(booking.page.locator('#childName')).not.toBeVisible();
    await expect(booking.page.locator('#childAge')).not.toBeVisible();
  });

  test('Full Public Event flow: submits and shows Thank You screen', async () => {
    await booking.fillStep1({ firstName: 'Alex', eventType: 'Public Event' });
    await booking.clickNext();
    await booking.fillStep2();
    await booking.clickNext();
    await booking.selectPackage('One Hour Meet and Greet');
    // Add Storytime extra (free)
    await booking.selectExtra('Storytime - No additional charge!');
    await booking.clickNext();
    await booking.selectNumCharacters('1');
    await booking.selectCharacter('Snow Princess');
    await booking.clickNext();
    await booking.fillStep5Public({
      orgName: 'Enchanted Library',
      attendance: '50',
      locationPref: 'Indoor',
      photoPref: 'Yes',
    });
    await booking.clickNext();

    // Review should say "Public Event for Enchanted Library"
    await expect(
      booking.page.locator('text=Public Event for Enchanted Library')
    ).toBeVisible();

    await booking.checkTOS();
    await booking.clickSendRequest();
    await booking.waitForThankYou();

    await expect(booking.page.locator('h1:has-text("Thank You, Alex")')).toBeVisible();
  });
});
