import { DateTime } from "luxon";
import { mapFormValuesToRequestBody } from "../BookClient";
import type { FormValues } from "../BookClient";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFormValues(overrides: Partial<FormValues> = {}): FormValues {
  return {
    FirstName: "Jane",
    LastName: "Doe",
    Email: "jane@example.com",
    Phone: "555-123-4567",
    EventType: "Birthday Party",
    Date: DateTime.fromISO("2026-07-04"),
    Time: "2:00 PM",
    StreetAddress: "123 Main St",
    City: "Springfield",
    State: "VA",
    Zip: "22150",
    Package: 0,
    Extras: [],
    NumCharacters: "1",
    Character: [{ characterId: 1, dressId: 0 }],
    ChildName: "Lily",
    ChildAge: "5",
    OrganizationName: undefined,
    Attendance: "20",
    LocationPref: "Indoor",
    PhotoPref: "Yes",
    AdditionalInfo: undefined,
    AgreeToTOS: true,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("mapFormValuesToRequestBody", () => {
  describe("personal information", () => {
    it("maps FirstName / LastName / Email / Phone directly", () => {
      const result = mapFormValuesToRequestBody(makeFormValues());
      expect(result.firstName).toBe("Jane");
      expect(result.lastName).toBe("Doe");
      expect(result.email).toBe("jane@example.com");
      expect(result.phone).toBe("555-123-4567");
    });
  });

  describe("dateTime formatting", () => {
    it("produces a valid ISO string in America/New_York timezone", () => {
      const result = mapFormValuesToRequestBody(makeFormValues());
      expect(result.dateTime).toBeTruthy();
      const parsed = DateTime.fromISO(result.dateTime as string);
      expect(parsed.isValid).toBe(true);
    });

    it("combines the date and a valid time correctly", () => {
      const result = mapFormValuesToRequestBody(
        makeFormValues({ Date: DateTime.fromISO("2026-07-04"), Time: "3:30 PM" })
      );
      const parsed = DateTime.fromISO(result.dateTime as string, {
        zone: "America/New_York",
      });
      expect(parsed.hour).toBe(15);
      expect(parsed.minute).toBe(30);
      expect(parsed.month).toBe(7);
      expect(parsed.day).toBe(4);
    });

    it("defaults to midnight (00:00) when the time string is invalid", () => {
      const result = mapFormValuesToRequestBody(
        makeFormValues({ Time: "NOT_A_TIME" })
      );
      const parsed = DateTime.fromISO(result.dateTime as string, {
        zone: "America/New_York",
      });
      expect(parsed.hour).toBe(0);
      expect(parsed.minute).toBe(0);
    });

    it("correctly handles AM times (10:15 AM)", () => {
      const result = mapFormValuesToRequestBody(
        makeFormValues({ Time: "10:15 AM" })
      );
      const parsed = DateTime.fromISO(result.dateTime as string, {
        zone: "America/New_York",
      });
      expect(parsed.hour).toBe(10);
      expect(parsed.minute).toBe(15);
    });

    it("correctly handles noon (12:00 PM)", () => {
      const result = mapFormValuesToRequestBody(
        makeFormValues({ Time: "12:00 PM" })
      );
      const parsed = DateTime.fromISO(result.dateTime as string, {
        zone: "America/New_York",
      });
      expect(parsed.hour).toBe(12);
      expect(parsed.minute).toBe(0);
    });
  });

  describe("address construction", () => {
    it("concatenates address parts into a single string", () => {
      const result = mapFormValuesToRequestBody(makeFormValues());
      expect(result.address).toBe("123 Main St, Springfield, VA 22150");
    });

    it("handles different state / zip combinations", () => {
      const result = mapFormValuesToRequestBody(
        makeFormValues({
          StreetAddress: "456 Oak Ave",
          City: "Richmond",
          State: "VA",
          Zip: "23220",
        })
      );
      expect(result.address).toBe("456 Oak Ave, Richmond, VA 23220");
    });
  });

  describe("package and event type", () => {
    it("passes packageId through as-is", () => {
      const result = mapFormValuesToRequestBody(makeFormValues({ Package: 2 }));
      expect(result.packageId).toBe(2);
    });

    it("passes eventType through as-is", () => {
      const result = mapFormValuesToRequestBody(
        makeFormValues({ EventType: "Public Event" })
      );
      expect(result.eventType).toBe("Public Event");
    });
  });

  describe("characterSelections and extras", () => {
    it("passes characterSelections array through", () => {
      const chars = [
        { characterId: 1, dressId: 0 },
        { characterId: 3, dressId: 10 },
      ];
      const result = mapFormValuesToRequestBody(
        makeFormValues({ Character: chars })
      );
      expect(result.characterSelections).toEqual(chars);
    });

    it("defaults characterSelections to [] when Character is empty", () => {
      const result = mapFormValuesToRequestBody(
        makeFormValues({ Character: [] })
      );
      expect(result.characterSelections).toEqual([]);
    });

    it("passes extrasIds array through", () => {
      const result = mapFormValuesToRequestBody(
        makeFormValues({ Extras: [0, 1, 2] })
      );
      expect(result.extrasIds).toEqual([0, 1, 2]);
    });

    it("defaults extrasIds to [] when Extras is undefined", () => {
      const result = mapFormValuesToRequestBody(
        makeFormValues({ Extras: undefined })
      );
      expect(result.extrasIds).toEqual([]);
    });
  });

  describe("optional child / org fields", () => {
    it("sets childName to the provided value", () => {
      const result = mapFormValuesToRequestBody(
        makeFormValues({ ChildName: "Sofia" })
      );
      expect(result.childName).toBe("Sofia");
    });

    it("sets childName to null when ChildName is empty string", () => {
      const result = mapFormValuesToRequestBody(
        makeFormValues({ ChildName: "" })
      );
      expect(result.childName).toBeNull();
    });

    it("sets childName to null when ChildName is undefined", () => {
      const result = mapFormValuesToRequestBody(
        makeFormValues({ ChildName: undefined })
      );
      expect(result.childName).toBeNull();
    });

    it("converts ChildAge string to integer", () => {
      const result = mapFormValuesToRequestBody(
        makeFormValues({ ChildAge: "7" })
      );
      expect(result.childAge).toBe(7);
    });

    it("sets childAge to null when ChildAge is empty string", () => {
      const result = mapFormValuesToRequestBody(
        makeFormValues({ ChildAge: "" })
      );
      expect(result.childAge).toBeNull();
    });

    it("sets childAge to null when ChildAge is undefined", () => {
      const result = mapFormValuesToRequestBody(
        makeFormValues({ ChildAge: undefined })
      );
      expect(result.childAge).toBeNull();
    });

    it("sets orgName to the provided value", () => {
      const result = mapFormValuesToRequestBody(
        makeFormValues({ OrganizationName: "Springfield Library" })
      );
      expect(result.orgName).toBe("Springfield Library");
    });

    it("sets orgName to null when OrganizationName is undefined", () => {
      const result = mapFormValuesToRequestBody(
        makeFormValues({ OrganizationName: undefined })
      );
      expect(result.orgName).toBeNull();
    });
  });

  describe("attendance / numChildren", () => {
    it("converts Attendance string to integer", () => {
      const result = mapFormValuesToRequestBody(
        makeFormValues({ Attendance: "35" })
      );
      expect(result.numChildren).toBe(35);
    });

    it("handles single-digit attendance", () => {
      const result = mapFormValuesToRequestBody(
        makeFormValues({ Attendance: "5" })
      );
      expect(result.numChildren).toBe(5);
    });
  });

  describe("photoPref conversion", () => {
    it('converts "Yes" to true (case insensitive)', () => {
      expect(
        mapFormValuesToRequestBody(makeFormValues({ PhotoPref: "Yes" })).photoPref
      ).toBe(true);
      expect(
        mapFormValuesToRequestBody(makeFormValues({ PhotoPref: "yes" })).photoPref
      ).toBe(true);
      expect(
        mapFormValuesToRequestBody(makeFormValues({ PhotoPref: "YES" })).photoPref
      ).toBe(true);
    });

    it('converts "No" to false', () => {
      expect(
        mapFormValuesToRequestBody(makeFormValues({ PhotoPref: "No" })).photoPref
      ).toBe(false);
    });
  });

  describe("additionalInfo", () => {
    it("passes additionalInfo through when provided", () => {
      const result = mapFormValuesToRequestBody(
        makeFormValues({ AdditionalInfo: "Peanut allergy" })
      );
      expect(result.additionalInfo).toBe("Peanut allergy");
    });

    it("sets additionalInfo to null when undefined", () => {
      const result = mapFormValuesToRequestBody(
        makeFormValues({ AdditionalInfo: undefined })
      );
      expect(result.additionalInfo).toBeNull();
    });
  });

  describe("agreeToTos", () => {
    it("passes AgreeToTOS = true through", () => {
      const result = mapFormValuesToRequestBody(
        makeFormValues({ AgreeToTOS: true })
      );
      expect(result.agreeToTos).toBe(true);
    });

    it("passes AgreeToTOS = false through", () => {
      const result = mapFormValuesToRequestBody(
        makeFormValues({ AgreeToTOS: false })
      );
      expect(result.agreeToTos).toBe(false);
    });
  });
});
