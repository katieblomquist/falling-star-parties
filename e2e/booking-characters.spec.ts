/**
 * booking-characters.spec.ts
 *
 * Tests character selection mechanics in Step 4:
 *   - NumCharacters dropdown gates how many character cards can be selected
 *   - Once limit is reached, unselected cards are hidden
 *   - "Clear Character Selection" resets the array
 *   - Dress accordion appears after all characters are selected
 *   - Dress can be selected and cleared
 */

import { test, expect } from '@playwright/test';
import { BookingPage } from './helpers/BookingPage';

/** Navigate to Step 4 (Characters) with Birthday Party pre-filled */
async function reachStep4(booking: BookingPage) {
  await booking.fillStep1({ eventType: 'Birthday Party' });
  await booking.clickNext();
  await booking.fillStep2();
  await booking.clickNext();
  await booking.selectPackage('Dream');
  await booking.clickNext();
}

test.describe('Step 4: Characters', () => {
  let booking: BookingPage;

  test.beforeEach(async ({ page }) => {
    booking = new BookingPage(page);
    await booking.goto();
  });

  // --------------------------------------------------------------------------
  // NumCharacters dropdown
  // --------------------------------------------------------------------------

  test('Character grid is hidden until NumCharacters is selected', async () => {
    await reachStep4(booking);

    // No character cards should be visible yet
    await expect(booking.page.locator('[class*="characterCard"]').first()).not.toBeVisible();
  });

  test('Character grid appears after selecting NumCharacters', async () => {
    await reachStep4(booking);
    await booking.selectNumCharacters('1');

    await expect(booking.page.locator('[class*="characterCard"]').first()).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // Selection count enforcement
  // --------------------------------------------------------------------------

  test('Selecting 1 character when limit=1 completes the step', async () => {
    await reachStep4(booking);
    await booking.selectNumCharacters('1');
    await booking.selectCharacter('Ice Queen');
    expect(await booking.isNextEnabled()).toBe(true);
  });

  test('With limit=1: remaining unselected characters are hidden after selection', async () => {
    await reachStep4(booking);
    await booking.selectNumCharacters('1');
    await booking.selectCharacter('Ice Queen');

    // All 8 characters start visible; after selecting 1 the other 7 should be hidden.
    // Use the outer selectionCard wrapper class to avoid matching nested inner divs.
    const visibleCards = await booking.page
      .locator('[class*="selectionCard_characterCard"]')
      .all();

    // Only the selected card (Ice Queen) should remain visible
    let visibleCount = 0;
    for (const card of visibleCards) {
      if (await card.isVisible()) visibleCount++;
    }
    expect(visibleCount).toBe(1);
  });

  test('With limit=2: step is incomplete after only 1 character selected', async () => {
    await reachStep4(booking);
    await booking.selectNumCharacters('2');
    await booking.selectCharacter('Ice Queen');
    expect(await booking.isNextEnabled()).toBe(false);
  });

  test('With limit=2: step completes after 2 characters selected', async () => {
    await reachStep4(booking);
    await booking.selectNumCharacters('2');
    await booking.selectCharacter('Ice Queen');
    await booking.selectCharacter('Snow Princess');
    expect(await booking.isNextEnabled()).toBe(true);
  });

  test('Cannot exceed the NumCharacters limit', async () => {
    await reachStep4(booking);
    await booking.selectNumCharacters('1');
    await booking.selectCharacter('Ice Queen');

    // After limit reached, other cards are hidden — trying to click them is a no-op
    // The character array should remain length 1
    // (We verify by checking no additional characterCardActive appears)
    const activeCards = await booking.page.locator('[class*="characterCardActive"]').count();
    expect(activeCards).toBe(1);
  });

  // --------------------------------------------------------------------------
  // Clear Character Selection
  // --------------------------------------------------------------------------

  test('"Clear Character Selection" resets characters to empty', async () => {
    await reachStep4(booking);
    await booking.selectNumCharacters('2');
    await booking.selectCharacter('Ice Queen');
    await booking.selectCharacter('Snow Princess');

    // Both selected
    expect(await booking.page.locator('[class*="characterCardActive"]').count()).toBe(2);

    await booking.clickClearCharacterSelection();

    // All cards should be unselected
    expect(await booking.page.locator('[class*="characterCardActive"]').count()).toBe(0);

    // Step should now be incomplete
    expect(await booking.isNextEnabled()).toBe(false);
  });

  test('"Clear Character Selection" link is only visible when a character is selected', async () => {
    await reachStep4(booking);
    await booking.selectNumCharacters('1');

    // No selection yet — link should not be visible
    await expect(
      booking.page.locator('span:has-text("Clear Character Selection")')
    ).not.toBeVisible();

    await booking.selectCharacter('Ice Queen');

    // Now visible
    await expect(
      booking.page.locator('span:has-text("Clear Character Selection")')
    ).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // Dress accordion
  // --------------------------------------------------------------------------

  test('Dress accordion is hidden before all characters are selected', async () => {
    await reachStep4(booking);
    await booking.selectNumCharacters('2');
    await booking.selectCharacter('Ice Queen');

    // Only 1 of 2 selected — attire section should not appear
    await expect(
      booking.page.locator('h3:has-text("Select Preferred Attire")')
    ).not.toBeVisible();
  });

  test('Dress accordion appears once all characters are selected', async () => {
    await reachStep4(booking);
    await booking.selectNumCharacters('1');
    await booking.selectCharacter('Ice Queen');

    await expect(
      booking.page.locator('h3:has-text("Select Preferred Attire")')
    ).toBeVisible();
  });

  test('Opening character accordion shows dress options', async () => {
    await reachStep4(booking);
    await booking.selectNumCharacters('1');
    await booking.selectCharacter('Ice Queen');

    await booking.openDressAccordion('Ice Queen');

    // Ice Queen dresses: Ice Dress, Elements Dress, Adventure Dress, Yuletide Dress, Any
    await expect(booking.page.locator('[class*="selectionCard_characterCard"]').filter({ hasText: 'Ice Dress' }).first()).toBeVisible();
    await expect(booking.page.locator('[class*="selectionCard_characterCard"]').filter({ hasText: 'Elements Dress' }).first()).toBeVisible();
  });

  test('Selecting a dress marks it as active', async () => {
    await reachStep4(booking);
    await booking.selectNumCharacters('1');
    await booking.selectCharacter('Ice Queen');
    await booking.openDressAccordion('Ice Queen');
    await booking.selectDress('Ice Dress');

    await expect(
      booking.page.locator('[class*="characterCardActive"]').filter({ hasText: 'Ice Dress' })
    ).toBeVisible();
  });

  test('"Clear Dress Selection" resets dress to no preference', async () => {
    await reachStep4(booking);
    await booking.selectNumCharacters('1');
    await booking.selectCharacter('Ice Queen');
    await booking.openDressAccordion('Ice Queen');
    await booking.selectDress('Ice Dress');

    // Clear Dress Selection link should appear after a dress is selected
    await expect(
      booking.page.locator('span:has-text("Clear Dress Selection")')
    ).toBeVisible();

    await booking.clickClearDressSelection();

    // After clearing, the link should disappear (dressId back to -1)
    await expect(
      booking.page.locator('span:has-text("Clear Dress Selection")')
    ).not.toBeVisible();
  });

  test('Selecting a dress does not affect step completion', async () => {
    // Dress selection is optional — step should remain complete
    await reachStep4(booking);
    await booking.selectNumCharacters('1');
    await booking.selectCharacter('Ice Queen');

    // Step is complete without a dress
    expect(await booking.isNextEnabled()).toBe(true);

    await booking.openDressAccordion('Ice Queen');
    await booking.selectDress('Ice Dress');

    // Still complete after selecting a dress
    expect(await booking.isNextEnabled()).toBe(true);
  });
});
