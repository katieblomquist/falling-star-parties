/**
 * booking-charity-event.spec.ts
 *
 * Full end-to-end happy path for a Charity Event booking.
 *
 * Key differences:
 *  - Step 3: Charity Event packages at reduced prices ($175 / $250)
 *  - Step 3: No extras section (Charity has no extras in mockdata)
 *  - Step 5: OrganizationName instead of ChildName + ChildAge
 */

import { test, expect } from '@playwright/test';
import { stubRecaptcha } from './helpers/stubRecaptcha';
import { mockCreateEventSuccess } from './helpers/mockApi';
import { BookingPage } from './helpers/BookingPage';

test.describe('Charity Event — full booking flow', () => {
  let booking: BookingPage;

  test.beforeEach(async ({ page }) => {
    await stubRecaptcha(page);
    await mockCreateEventSuccess(page, 'charity-event-page-id');
    booking = new BookingPage(page);
    await booking.goto();
  });

  test('Step 3: shows Charity Event packages at correct prices', async () => {
    await booking.fillStep1({ eventType: 'Charity Event' });
    await booking.clickNext();
    await booking.fillStep2();
    await booking.clickNext();

    // Charity pricing
    await expect(
      booking.page.locator('text=One Hour Meet and Greet - Starting at $175')
    ).toBeVisible();
    await expect(
      booking.page.locator('text=Two Hour Meet and Greet - Starting at $250')
    ).toBeVisible();

    // Public Event packages at higher prices must not appear
    await expect(
      booking.page.locator('text=One Hour Meet and Greet - Starting at $250')
    ).not.toBeVisible();
  });

  test('Step 3: no extras are shown for Charity Event', async () => {
    await booking.fillStep1({ eventType: 'Charity Event' });
    await booking.clickNext();
    await booking.fillStep2();
    await booking.clickNext();

    // The Enchanting Extras header should be present but empty
    await expect(
      booking.page.locator('h3:has-text("Select Your Enchanting Extras")')
    ).toBeVisible();
    // No extra cards should render
    await expect(booking.page.locator('text=Storytime')).not.toBeVisible();
    await expect(booking.page.locator('text=Storybook Keepsake')).not.toBeVisible();
  });

  test('Full Charity Event flow: submits and shows Thank You screen', async () => {
    await booking.fillStep1({ firstName: 'Morgan', eventType: 'Charity Event' });
    await booking.clickNext();
    await booking.fillStep2();
    await booking.clickNext();
    // Select charity package (Two Hour)
    await booking.selectPackage('Two Hour Meet and Greet');
    await booking.clickNext();
    await booking.selectNumCharacters('1');
    await booking.selectCharacter('Rose Princess');
    await booking.clickNext();
    await booking.fillStep5Public({
      orgName: 'Hope Foundation',
      attendance: '100',
      locationPref: 'Outdoor',
      photoPref: 'No',
    });
    await booking.clickNext();

    await expect(
      booking.page.locator('text=Charity Event for Hope Foundation')
    ).toBeVisible();

    await booking.checkTOS();
    await booking.clickSendRequest();
    await booking.waitForThankYou();

    await expect(booking.page.locator('h1:has-text("Thank You, Morgan")')).toBeVisible();
  });
});
