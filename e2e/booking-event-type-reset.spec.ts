/**
 * booking-event-type-reset.spec.ts
 *
 * Tests that changing EventType on Step 1 resets dependent fields:
 *   ChildAge, ChildName, Extras, OrganizationName, Package
 *
 * Specifically:
 * 1. User selects Birthday Party → advances to Step 3 → picks a package
 * 2. Returns to Step 1 → changes EventType to Public Event
 * 3. On Step 3 the package selection is cleared and only Public Event
 *    packages are shown
 * 4. After full Birthday details entry, switching type clears Step 5 fields
 */

import { test, expect } from '@playwright/test';
import { BookingPage } from './helpers/BookingPage';

test.describe('EventType field reset behavior', () => {
  let booking: BookingPage;

  test.beforeEach(async ({ page }) => {
    booking = new BookingPage(page);
    await booking.goto();
  });

  test('Changing EventType from Birthday to Public clears Package selection', async () => {
    // Step 1 — Birthday Party
    await booking.fillStep1({ eventType: 'Birthday Party' });
    await booking.clickNext();

    // Step 2
    await booking.fillStep2();
    await booking.clickNext();

    // Step 3 — pick a Birthday package
    await booking.selectPackage('Dream');
    // Verify selected (the card should show an active state)
    await expect(
      booking.page.locator('[class*="textCardActive"]').filter({ hasText: 'Dream' })
    ).toBeVisible();

    // Go back to Step 1 via Back × 2
    await booking.clickBack();
    await booking.clickBack();

    // Change EventType — this should call resetField on Package, Extras, etc.
    await booking.selectEventType('Public Event');

    // Go back to Step 3
    await booking.clickNext();
    await booking.fillStep2(); // re-fill in case fields got reset
    await booking.clickNext();

    // The Birthday package "Dream" must NOT appear
    await expect(booking.page.locator('text=Dream - Starting at $200')).not.toBeVisible();

    // The previously selected Dream package should be cleared — no active card
    await expect(
      booking.page.locator('[class*="textCardActive"]').filter({ hasText: 'Dream' })
    ).not.toBeVisible();

    // Public packages should now be visible
    await expect(
      booking.page.locator('text=One Hour Meet and Greet - Starting at $250')
    ).toBeVisible();
  });

  test('Changing EventType resets Extras selection', async () => {
    // Setup: Birthday Party → pick extra "Storybook Keepsake"
    await booking.fillStep1({ eventType: 'Birthday Party' });
    await booking.clickNext();
    await booking.fillStep2();
    await booking.clickNext();

    await booking.selectExtra('Storybook Keepsake');
    await expect(
      booking.page.locator('[class*="textCardActive"]').filter({ hasText: 'Storybook Keepsake' })
    ).toBeVisible();

    // Return to Step 1, switch to Public Event
    await booking.clickBack();
    await booking.clickBack();
    await booking.selectEventType('Public Event');

    // Go back to Step 3
    await booking.clickNext();
    await booking.fillStep2();
    await booking.clickNext();

    // Birthday extras no longer exist; Public extras are different
    await expect(booking.page.locator('text=Storybook Keepsake')).not.toBeVisible();
    // No active card from the previous birthday selection
    await expect(
      booking.page.locator('[class*="textCardActive"]').filter({ hasText: 'Storybook Keepsake' })
    ).not.toBeVisible();
  });

  test('Switching from Birthday to Public Event shows OrganizationName on Step 5', async () => {
    // Get all the way to Step 5 as Birthday Party
    await booking.fillStep1({ eventType: 'Birthday Party' });
    await booking.clickNext();
    await booking.fillStep2();
    await booking.clickNext();
    await booking.selectPackage('Dream');
    await booking.clickNext();
    await booking.selectNumCharacters('1');
    await booking.selectCharacter('Ice Queen');
    await booking.clickNext();

    // Step 5 for Birthday: ChildName should be visible
    await expect(booking.page.locator('#childName')).toBeVisible();

    // Go all the way back to Step 1 and switch
    await booking.clickBack();
    await booking.clickBack();
    await booking.clickBack();
    await booking.clickBack();
    await booking.selectEventType('Public Event');

    // Re-navigate to Step 5
    await booking.clickNext();
    await booking.fillStep2();
    await booking.clickNext();
    await booking.selectPackage('One Hour Meet and Greet');
    await booking.clickNext();
    await booking.selectNumCharacters('1');
    // Ice Queen may still be selected from the first pass — clear before re-selecting
    const clearLink = booking.page.locator('span:has-text("Clear Character Selection")');
    if (await clearLink.isVisible()) {
      await booking.clickClearCharacterSelection();
    }
    await booking.selectCharacter('Ice Queen');
    await booking.clickNext();

    // Now OrganizationName should be visible, ChildName should not
    await expect(booking.page.locator('#organizationName')).toBeVisible();
    await expect(booking.page.locator('#childName')).not.toBeVisible();
  });

  test('Switching EventType back to Birthday Party shows child fields again', async () => {
    // Start as Public Event
    await booking.fillStep1({ eventType: 'Public Event' });
    await booking.clickNext();
    await booking.fillStep2();
    await booking.clickNext();
    await booking.selectPackage('One Hour Meet and Greet');
    await booking.clickNext();
    await booking.selectNumCharacters('1');
    await booking.selectCharacter('Ice Queen');
    await booking.clickNext();

    // Step 5: org name visible
    await expect(booking.page.locator('#organizationName')).toBeVisible();

    // Go back to Step 1 and switch back to Birthday Party
    await booking.clickBack();
    await booking.clickBack();
    await booking.clickBack();
    await booking.clickBack();
    await booking.selectEventType('Birthday Party');

    // Re-navigate to Step 5
    await booking.clickNext();
    await booking.fillStep2();
    await booking.clickNext();
    await booking.selectPackage('Dream');
    await booking.clickNext();
    await booking.selectNumCharacters('1');
    // Ice Queen may still be selected from the first pass — clear before re-selecting
    const clearLink2 = booking.page.locator('span:has-text("Clear Character Selection")');
    if (await clearLink2.isVisible()) {
      await booking.clickClearCharacterSelection();
    }
    await booking.selectCharacter('Ice Queen');
    await booking.clickNext();

    await expect(booking.page.locator('#childName')).toBeVisible();
    await expect(booking.page.locator('#organizationName')).not.toBeVisible();
  });
});
