import { Page } from '@playwright/test';
import { DateTime } from 'luxon';
import { selectDropdownOption } from './fillStep1';

/**
 * Fills all required fields on Step 2 (Time & Location).
 *
 * The date picker is a custom calendar widget (DateSelector component).
 *   - Trigger div has class "input" or "inputActive" (CSS module hashed).
 *   - When no date selected it shows <p class="nonSelected">MM/DD/YYYY</p>.
 *   - Calendar nav arrows: right (next) has class "arrow", left (prev) on current
 *     month has class "arrowCurrentMonth" (visually disabled).
 *   - Day cells: class "unselected" (clickable), "disabled" (past/today), "selected".
 *
 * The Time field is the custom Dropdown component (div#nick-test).
 * Address fields use plain <input> elements with ids: streetAddress, city, state, zip.
 */
export async function fillStep2(
  page: Page,
  opts: {
    /** Luxon DateTime for the target date. Must be a future date. Defaults to 30 days from now. */
    date?: DateTime;
    time?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    zip?: string;
  } = {}
): Promise<void> {
  const {
    date = DateTime.now().plus({ days: 30 }),
    time = '2:00 PM',
    streetAddress = '123 Enchanted Lane',
    city = 'Springfield',
    state = 'VA',
    zip = '22150',
  } = opts;

  // --- Date picker ---
  // Click the date selector trigger. It lives inside a div[class*="selector"].
  // The trigger div itself has a class matching "input" (not "inputActive" yet).
  const dateTrigger = page.locator('[class*="selector"] [class*="input"]').first();
  await dateTrigger.click();

  // Navigate months until we reach the target month/year.
  // The calendar starts at today's month (or the currently selected date's month).
  const today = DateTime.now();
  const monthsAhead = (date.year - today.year) * 12 + (date.month - today.month);
  for (let i = 0; i < monthsAhead; i++) {
    // Right arrow (next month): class contains "arrow" but NOT "Current"
    await page
      .locator('[class*="calendar"] [class*="arrow"]:not([class*="Current"])')
      .last()
      .click();
  }

  // Click the target day: enabled days have class "unselected" in date.module.css
  await page
    .locator('[class*="unselected"]')
    .filter({ hasText: new RegExp(`^${date.day}$`) })
    .first()
    .click();

  // --- Time dropdown ---
  // In TimeLocation.tsx: <h4>Time</h4> then <div class="timeInputContainer"> wrapping
  // the dropdown. The heading and wrapper share a parent <div>, so the parent-walk
  // strategy finds the [id="nick-test"] dropdown inside.
  await selectDropdownOption(page, 'Time', time);

  // --- Address fields ---
  await page.locator('#streetAddress').fill(streetAddress);
  await page.locator('#city').fill(city);
  await page.locator('#state').fill(state);
  await page.locator('#zip').fill(zip);
}
