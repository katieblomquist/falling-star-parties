import { Page } from '@playwright/test';

/**
 * Selects an option from the custom Dropdown component.
 *
 * The Dropdown renders:
 *   <div id="nick-test" class="dropdown__*">
 *     <div class="selected__*" onClick>  ← trigger
 *       <p>{selected}</p>
 *       <icon />
 *     </div>
 *     <div class="options__*">           ← appears when open
 *       <p class="option__*">option1</p>
 *       ...
 *     </div>
 *   </div>
 *
 * The label (h3 or h4) and the dropdown share a parent <div>.
 * We walk up to the parent with xpath=.. then find [id="nick-test"] > div inside.
 *
 * @param page       - Playwright Page
 * @param label      - The text of the h3 or h4 label above the dropdown
 * @param optionText - The exact text of the option to select
 */
export async function selectDropdownOption(
  page: Page,
  label: string,
  optionText: string
): Promise<void> {
  const heading = page
    .locator(`h3:text-is("${label}"), h4:text-is("${label}")`)
    .first();

  // Walk up to parent container, then find the dropdown trigger (first child div
  // of the [id="nick-test"] container)
  const trigger = heading.locator('xpath=..').locator('[id="nick-test"] > div').first();
  await trigger.click();

  // Click the matching option text
  await page.locator(`p:text-is("${optionText}")`).first().click();
}

/**
 * Fills all fields on Step 1 (Your Information).
 *
 * Uses the HTML input id attributes set in information.tsx:
 *   firstName, lastName, email, phone  + the EventType Dropdown.
 */
export async function fillStep1(
  page: Page,
  opts: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    eventType?: string;
  } = {}
): Promise<void> {
  const {
    firstName = 'Jane',
    lastName = 'Doe',
    email = 'jane.doe@example.com',
    phone = '555-867-5309',
    eventType = 'Birthday Party',
  } = opts;

  await page.locator('#firstName').fill(firstName);
  await page.locator('#lastName').fill(lastName);
  await page.locator('#email').fill(email);
  await page.locator('#phone').fill(phone);

  // EventType dropdown
  await selectDropdownOption(page, 'Event Type', eventType);
}
