import { Page, Locator, expect } from '@playwright/test';

/**
 * BookingPage — a lightweight page-object that wraps the /book stepper.
 *
 * All interaction helpers scroll to ensure the target element is in view,
 * because the stepper auto-scrolls to active step headers and can
 * occasionally shift layout before an action completes.
 */
export class BookingPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/book');
    // Wait for the first step heading to appear
    await this.page.waitForSelector('h4:has-text("Your Information")', { timeout: 15_000 });
  }

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  /** Click the "Next" button for the current step */
  async clickNext() {
    await this.page.locator('p:text-is("Next")').last().click();
  }

  /** Click the "Back" button */
  async clickBack() {
    await this.page.locator('p:text-is("Back")').last().click();
  }

  /** Click "Send Request" (final submit button) */
  async clickSendRequest() {
    await this.page.locator('p:text-is("Send Request")').last().click();
  }

  /** Click "Edit Your Event" (secondary final step button) */
  async clickEditYourEvent() {
    await this.page.locator('p:text-is("Edit Your Event")').last().click();
  }

  /** Click a step header by its title text (only works in review mode) */
  async clickStepHeader(title: string) {
    await this.page.locator(`h4:has-text("${title}")`).first().click();
  }

  // ---------------------------------------------------------------------------
  // Dropdown helper — finds the nearest [id="nick-test"] dropdown relative
  // to the heading element that labels it, then clicks the trigger and option.
  // ---------------------------------------------------------------------------

  /**
   * Opens a labelled dropdown and selects an option.
   *
   * Strategy: locate the h3/h4 label, walk up to its parent container with
   * `xpath=..`, then find the [id="nick-test"] > div.selected trigger inside.
   *
   * @param labelText  - The exact (or partial) text of the h3/h4 label
   * @param optionText - The exact text of the option to select
   */
  private async selectDropdown(labelText: string, optionText: string) {
    // Use :text-is for exact match to avoid collisions with stepper section headers.
    // e.g. h4:text-is("Time") must NOT match h4 "Time & Location" in the stepper.
    const heading = this.page
      .locator(`h3:text-is("${labelText}"), h4:text-is("${labelText}")`)
      .first();

    // Walk up to parent container, then find the dropdown trigger within it
    const trigger = heading.locator('xpath=..').locator('[id="nick-test"] > div').first();
    await trigger.click();

    // Option <p> elements appear in a dropdown_options div — click by exact text
    await this.page.locator(`p.${await this._dropdownOptionClass()}:text-is("${optionText}")`).first().click().catch(async () => {
      // Fallback: class name may vary — just find a visible <p> with exact text
      // that appeared after the dropdown opened
      await this.page.locator(`p:text-is("${optionText}")`).first().click();
    });
  }

  /** Cached CSS module class for dropdown option items */
  private _optionClass: string | null = null;
  private async _dropdownOptionClass(): Promise<string> {
    if (this._optionClass) return this._optionClass;
    return ''; // just use bare p:text-is selector (fallback path)
  }

  // ---------------------------------------------------------------------------
  // Step 1 — Your Information
  // ---------------------------------------------------------------------------

  async fillFirstName(value: string) {
    await this.page.locator('#firstName').fill(value);
  }
  async fillLastName(value: string) {
    await this.page.locator('#lastName').fill(value);
  }
  async fillEmail(value: string) {
    await this.page.locator('#email').fill(value);
  }
  async fillPhone(value: string) {
    await this.page.locator('#phone').fill(value);
  }

  async selectEventType(type: string) {
    // The Event Type h3 and the Dropdown (div#nick-test) share a parent <div>
    await this.selectDropdown('Event Type', type);
  }

  async fillStep1(opts: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    eventType?: string;
  } = {}) {
    const {
      firstName = 'Jane',
      lastName = 'Doe',
      email = 'jane.doe@example.com',
      phone = '555-867-5309',
      eventType = 'Birthday Party',
    } = opts;
    await this.fillFirstName(firstName);
    await this.fillLastName(lastName);
    await this.fillEmail(email);
    await this.fillPhone(phone);
    await this.selectEventType(eventType);
  }

  // ---------------------------------------------------------------------------
  // Step 2 — Time & Location
  // ---------------------------------------------------------------------------

  /**
   * Opens the calendar and selects a future day.
   * @param monthsAhead how many months forward from the current month to navigate
   * @param day         which day number to click
   */
  async selectDate(monthsAhead = 1, day = 15) {
    // The date trigger shows "MM/DD/YYYY" placeholder text when no date is selected.
    // The trigger div has class "input" or "inputActive" (CSS module).
    // We click the <p class="nonSelected"> or the parent input div.
    const dateTrigger = this.page.locator('[class*="selector"] [class*="input"]').first();
    await dateTrigger.click();

    // Navigate forward by clicking the right arrow (IconArrowNarrowRight).
    // The left arrow when on current month has class "arrowCurrentMonth" (disabled visually).
    // The right arrow always has class "arrow".
    for (let i = 0; i < monthsAhead; i++) {
      await this.page
        .locator('[class*="calendar"] [class*="arrow"]:not([class*="Current"])')
        .last()
        .click();
    }

    // Date cells: enabled days have class "unselected", disabled have "disabled",
    // selected have "selected". We want "unselected" cells matching the day number.
    await this.page
      .locator('[class*="unselected"]')
      .filter({ hasText: new RegExp(`^${day}$`) })
      .first()
      .click();
  }

  async selectTime(time = '2:00 PM') {
    // The Time h4 is a sibling of a wrapper div that contains the dropdown.
    // Use same parent-walk strategy.
    await this.selectDropdown('Time', time);
  }

  async fillAddress(opts: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  } = {}) {
    const {
      street = '123 Enchanted Lane',
      city = 'Springfield',
      state = 'VA',
      zip = '22150',
    } = opts;
    await this.page.locator('#streetAddress').fill(street);
    await this.page.locator('#city').fill(city);
    await this.page.locator('#state').fill(state);
    await this.page.locator('#zip').fill(zip);
  }

  async fillStep2(opts: { monthsAhead?: number; day?: number; time?: string } = {}) {
    await this.selectDate(opts.monthsAhead ?? 1, opts.day ?? 15);
    await this.selectTime(opts.time ?? '2:00 PM');
    await this.fillAddress();
  }

  // ---------------------------------------------------------------------------
  // Step 3 — Event Options
  // ---------------------------------------------------------------------------

  /** Clicks the selection card whose title contains the given text */
  async selectPackage(titleContains: string) {
    await this.page
      .locator('[class*="textCard"]')
      .filter({ hasText: titleContains })
      .first()
      .click();
  }

  async selectExtra(titleContains: string) {
    await this.page
      .locator('[class*="textCard"]')
      .filter({ hasText: titleContains })
      .first()
      .click();
  }

  // ---------------------------------------------------------------------------
  // Step 4 — Characters
  // ---------------------------------------------------------------------------

  async selectNumCharacters(num: string) {
    // "Number of Characters" h4 is the label; dropdown is a sibling descendant
    await this.selectDropdown('Number of Characters', num);
  }

  /** Clicks the character card whose name contains the given text */
  async selectCharacter(namePart: string) {
    await this.page
      .locator('[class*="characterCard"]')
      .filter({ hasText: namePart })
      .first()
      .click();
  }

  async clickClearCharacterSelection() {
    await this.page.locator('span:has-text("Clear Character Selection")').first().click();
  }

  /** Opens the dress accordion for a character */
  async openDressAccordion(characterName: string) {
    await this.page
      .locator('[class*="subheader"]')
      .filter({ hasText: characterName })
      .first()
      .click();
  }

  async selectDress(dressName: string) {
    await this.page
      .locator('[class*="characterCard"]')
      .filter({ hasText: dressName })
      .first()
      .click();
  }

  async clickClearDressSelection() {
    await this.page.locator('span:has-text("Clear Dress Selection")').first().click();
  }

  // ---------------------------------------------------------------------------
  // Step 5 — Event Details
  // ---------------------------------------------------------------------------

  async fillChildName(name: string) {
    await this.page.locator('#childName').fill(name);
  }
  async fillChildAge(age: string) {
    await this.page.locator('#childAge').fill(age);
  }
  async fillOrganizationName(name: string) {
    await this.page.locator('#organizationName').fill(name);
  }
  async fillAttendance(count: string) {
    await this.page.locator('#attendance').fill(count);
  }

  async selectLocationPref(value: string) {
    await this.selectDropdown('Location Preference', value);
  }

  async selectPhotoPref(value: string) {
    await this.selectDropdown('May we take photos of your event for our social media and website?', value);
  }

  async fillStep5Birthday(opts: {
    childName?: string;
    childAge?: string;
    attendance?: string;
    locationPref?: string;
    photoPref?: string;
  } = {}) {
    const {
      childName = 'Lily',
      childAge = '7',
      attendance = '15',
      locationPref = 'Indoor',
      photoPref = 'Yes',
    } = opts;
    await this.fillChildName(childName);
    await this.fillChildAge(childAge);
    await this.fillAttendance(attendance);
    await this.selectLocationPref(locationPref);
    await this.selectPhotoPref(photoPref);
  }

  async fillStep5Public(opts: {
    orgName?: string;
    attendance?: string;
    locationPref?: string;
    photoPref?: string;
  } = {}) {
    const {
      orgName = 'Enchanted Library',
      attendance = '50',
      locationPref = 'Indoor',
      photoPref = 'Yes',
    } = opts;
    await this.fillOrganizationName(orgName);
    await this.fillAttendance(attendance);
    await this.selectLocationPref(locationPref);
    await this.selectPhotoPref(photoPref);
  }

  // ---------------------------------------------------------------------------
  // Step 6 — Review Request
  // ---------------------------------------------------------------------------

  async checkTOS() {
    await this.page.locator('#agreeToTOS').check();
  }

  async uncheckTOS() {
    await this.page.locator('#agreeToTOS').uncheck();
  }

  // ---------------------------------------------------------------------------
  // Result screens
  // ---------------------------------------------------------------------------

  async waitForThankYou() {
    await this.page.waitForSelector('h1:has-text("Thank You")', { timeout: 15_000 });
  }

  async waitForSubmissionError() {
    await this.page.waitForSelector('h1:has-text("Oops")', { timeout: 15_000 });
  }

  // ---------------------------------------------------------------------------
  // Assertion helpers
  // ---------------------------------------------------------------------------

  /** Returns whether the Next button for the current step is visually enabled */
  async isNextEnabled(): Promise<boolean> {
    // Enabled variant has class "primary", disabled has "primaryDisabled"
    const count = await this.page.locator('[class*="primaryDisabled"]').count();
    const nextText = await this.page.locator('p:text-is("Next")').count();
    if (nextText === 0) return false; // not on a step with a Next button
    return count === 0;
  }

  async isSendRequestEnabled(): Promise<boolean> {
    const sendBtn = this.page.locator('p:text-is("Send Request")').last();
    const parent = sendBtn.locator('..');
    const className = await parent.getAttribute('class') ?? '';
    return !className.includes('Disabled');
  }
}
