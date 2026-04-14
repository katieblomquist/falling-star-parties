/**
 * booking-extras.spec.ts
 *
 * Tests the mutually-exclusive extras logic in Step 3 (Event Options).
 *
 * From eventOptions.tsx, the exclusion pairs are:
 *   IDs 0 & 1: "Storybook Keepsake" and "Deluxe Storybook Keepsake"
 *   IDs 2 & 3: "Deluxe Princess Set" and "Gift Bags"
 *   IDs 4 & 5: "Storytime" and "Interactive Storytime" (Public Event)
 *
 * The tests also verify:
 *   - Selecting the same extra twice deselects it (toggle off)
 *   - Multiple non-conflicting extras can be selected simultaneously
 *   - Extras are optional — step is complete without any extras selected
 */

import { test, expect } from '@playwright/test';
import { BookingPage } from './helpers/BookingPage';

/** Navigate to Step 3 with a specific EventType already chosen */
async function reachStep3(booking: BookingPage, eventType: 'Birthday Party' | 'Public Event') {
  await booking.fillStep1({ eventType });
  await booking.clickNext();
  await booking.fillStep2();
  await booking.clickNext();
}

test.describe('Step 3: Mutually exclusive extras', () => {
  let booking: BookingPage;

  test.beforeEach(async ({ page }) => {
    booking = new BookingPage(page);
    await booking.goto();
  });

  // --------------------------------------------------------------------------
  // Birthday Party extras (IDs 0-3)
  // --------------------------------------------------------------------------

  test.describe('Birthday Party extras', () => {
    test.beforeEach(async () => {
      await reachStep3(booking, 'Birthday Party');
    });

    test('Selecting "Storybook Keepsake" then "Deluxe Storybook Keepsake" deselects first', async () => {
      // Select Storybook Keepsake (id=0)
      await booking.selectExtra('Storybook Keepsake');
      await expect(
        booking.page.locator('[class*="textCardActive"]').filter({ hasText: 'Storybook Keepsake' })
      ).toBeVisible();

      // Select Deluxe Storybook Keepsake (id=1) — should remove id=0
      await booking.selectExtra('Deluxe Storybook Keepsake');
      await expect(
        booking.page.locator('[class*="textCardActive"]').filter({ hasText: 'Deluxe Storybook Keepsake' })
      ).toBeVisible();

      // "Storybook Keepsake" should now be deselected
      await expect(
        booking.page.locator('[class*="textCardActive"]').filter({ hasText: /^Storybook Keepsake/ })
      ).not.toBeVisible();
    });

    test('Selecting "Deluxe Storybook Keepsake" then "Storybook Keepsake" deselects first', async () => {
      await booking.selectExtra('Deluxe Storybook Keepsake');
      await booking.selectExtra('Storybook Keepsake');

      await expect(
        booking.page.locator('[class*="textCardActive"]').filter({ hasText: /^Storybook Keepsake/ })
      ).toBeVisible();
      await expect(
        booking.page.locator('[class*="textCardActive"]').filter({ hasText: 'Deluxe Storybook Keepsake' })
      ).not.toBeVisible();
    });

    test('Selecting "Deluxe Princess Set" then "Gift Bags" deselects first', async () => {
      // id=2 and id=3 are mutually exclusive
      await booking.selectExtra('Deluxe Princess Set');
      // Wait for "Deluxe Princess Set" to be active before selecting "Gift Bags"
      await expect(
        booking.page.locator('[class*="textCardActive"]').filter({ hasText: 'Deluxe Princess Set' })
      ).toBeVisible();
      await booking.selectExtra('Gift Bags');

      await expect(
        booking.page.locator('[class*="textCardActive"]').filter({ hasText: 'Gift Bags' })
      ).toBeVisible();
      // Use h5 title match to avoid false positive from Gift Bags description
      // (Gift Bags description text contains "Deluxe Princess Set")
      await expect(
        booking.page.locator('[class*="textCardActive"] h5').filter({ hasText: /^Deluxe Princess Set/ })
      ).not.toBeVisible();
    });

    test('Non-conflicting extras can be selected together', async () => {
      // Storybook Keepsake (id=0) and Deluxe Princess Set (id=2) are NOT mutually exclusive
      await booking.selectExtra('Storybook Keepsake');
      await booking.selectExtra('Deluxe Princess Set');

      await expect(
        booking.page.locator('[class*="textCardActive"]').filter({ hasText: /^Storybook Keepsake/ })
      ).toBeVisible();
      await expect(
        booking.page.locator('[class*="textCardActive"]').filter({ hasText: 'Deluxe Princess Set' })
      ).toBeVisible();
    });

    test('Clicking a selected extra again deselects it (toggle off)', async () => {
      await booking.selectExtra('Storybook Keepsake');
      await expect(
        booking.page.locator('[class*="textCardActive"]').filter({ hasText: /^Storybook Keepsake/ })
      ).toBeVisible();

      // Click again to deselect
      await booking.selectExtra('Storybook Keepsake');
      await expect(
        booking.page.locator('[class*="textCardActive"]').filter({ hasText: /^Storybook Keepsake/ })
      ).not.toBeVisible();
    });

    test('Extras are optional — step completes with just a package', async () => {
      await booking.selectPackage('Dream');
      // No extras selected
      expect(await booking.isNextEnabled()).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // Public Event extras (IDs 4 & 5)
  // --------------------------------------------------------------------------

  test.describe('Public Event extras', () => {
    test.beforeEach(async () => {
      await reachStep3(booking, 'Public Event');
    });

    test('Selecting "Storytime" then "Interactive Storytime" deselects first', async () => {
      // id=4 and id=5 are mutually exclusive
      await booking.selectExtra('Storytime - No additional charge!');

      await expect(
        booking.page.locator('[class*="textCardActive"]').filter({ hasText: 'Storytime - No additional charge!' })
      ).toBeVisible();

      await booking.selectExtra('Interactive Storytime');

      await expect(
        booking.page.locator('[class*="textCardActive"]').filter({ hasText: 'Interactive Storytime' })
      ).toBeVisible();
      await expect(
        booking.page.locator('[class*="textCardActive"]').filter({ hasText: 'Storytime - No additional charge!' })
      ).not.toBeVisible();
    });

    test('Selecting "Interactive Storytime" then "Storytime" deselects first', async () => {
      await booking.selectExtra('Interactive Storytime');
      await booking.selectExtra('Storytime - No additional charge!');

      await expect(
        booking.page.locator('[class*="textCardActive"]').filter({ hasText: 'Storytime - No additional charge!' })
      ).toBeVisible();
      await expect(
        booking.page.locator('[class*="textCardActive"]').filter({ hasText: 'Interactive Storytime' })
      ).not.toBeVisible();
    });

    test('"Signature Cards" can be combined with Storytime', async () => {
      // Signature Cards (id=6) doesn't conflict with anything
      await booking.selectExtra('Storytime - No additional charge!');
      await booking.selectExtra('Signature Cards');

      await expect(
        booking.page.locator('[class*="textCardActive"]').filter({ hasText: 'Storytime - No additional charge!' })
      ).toBeVisible();
      await expect(
        booking.page.locator('[class*="textCardActive"]').filter({ hasText: 'Signature Cards' })
      ).toBeVisible();
    });
  });
});
