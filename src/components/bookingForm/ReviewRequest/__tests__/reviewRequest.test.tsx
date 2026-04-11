/**
 * reviewRequest.test.tsx
 *
 * Tests for the ReviewRequest step component:
 * - Renders a readable summary of the booking data
 * - TOS checkbox: unchecked triggers validation error, checked passes
 * - Birthday Party vs non-birthday rendering (child vs org name)
 * - Ordinal suffix helper (1st, 2nd, 3rd, 4th, …)
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useForm } from "react-hook-form";
import { DateTime } from "luxon";
import ReviewRequest from "../reviewRequest";
import type { FormValues } from "@/app/book/BookClient";

// ---------------------------------------------------------------------------
// Build fixture FormValues
// ---------------------------------------------------------------------------

function makeValues(overrides: Partial<FormValues> = {}): FormValues {
  return {
    FirstName: "Jane",
    LastName: "Doe",
    Email: "jane@example.com",
    Phone: "555-123-4567",
    EventType: "Birthday Party",
    Date: DateTime.fromISO("2026-07-04"), // July 4th
    Time: "2:00 PM",
    StreetAddress: "123 Main St",
    City: "Springfield",
    State: "VA",
    Zip: "22150",
    Package: 0, // packages[0] = Dream
    Extras: [],
    NumCharacters: "1",
    Character: [{ characterId: 1, dressId: 0 }], // Ice Queen
    ChildName: "Lily",
    ChildAge: "5",
    OrganizationName: undefined,
    Attendance: "20",
    LocationPref: "Indoor",
    PhotoPref: "Yes",
    AdditionalInfo: "No nuts please",
    AgreeToTOS: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Wrapper that wires a real useForm into ReviewRequest
// ---------------------------------------------------------------------------

function ReviewRequestWrapper({ values }: { values: FormValues }) {
  const {
    control,
    formState: { errors },
    trigger,
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: { AgreeToTOS: values.AgreeToTOS },
  });

  (window as any).__trigger = trigger;

  return (
    <ReviewRequest values={values} control={control} errors={errors} />
  );
}

function renderReview(overrides: Partial<FormValues> = {}) {
  return render(<ReviewRequestWrapper values={makeValues(overrides)} />);
}

async function triggerValidation() {
  await (window as any).__trigger();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ReviewRequest step", () => {
  describe("contact info summary", () => {
    it("renders the client full name", () => {
      renderReview();
      expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
    });

    it("renders the email address", () => {
      renderReview();
      expect(screen.getByText(/jane@example.com/)).toBeInTheDocument();
    });

    it("renders the phone number", () => {
      renderReview();
      expect(screen.getByText(/555-123-4567/)).toBeInTheDocument();
    });
  });

  describe("event summary", () => {
    it("renders the event date", () => {
      renderReview();
      // DateTime July 4 → "July 4th, 2026"
      expect(screen.getByText(/July/)).toBeInTheDocument();
      expect(screen.getByText(/2026/)).toBeInTheDocument();
    });

    it("renders the event time", () => {
      renderReview();
      expect(screen.getByText(/2:00 PM/)).toBeInTheDocument();
    });

    it("renders the address", () => {
      renderReview();
      expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
      expect(screen.getByText(/Springfield/)).toBeInTheDocument();
    });

    it("renders the additional comments", () => {
      renderReview();
      expect(screen.getByText(/No nuts please/)).toBeInTheDocument();
    });
  });

  describe("Birthday Party rendering", () => {
    it("shows child name in the event header", () => {
      renderReview({ EventType: "Birthday Party", ChildName: "Lily" });
      expect(screen.getByRole("heading", { level: 3, name: /Lily/ })).toBeInTheDocument();
    });

    it("shows the child's age with ordinal suffix (5th)", () => {
      renderReview({ EventType: "Birthday Party", ChildAge: "5" });
      expect(screen.getByRole("heading", { name: /5th/ })).toBeInTheDocument();
    });

    it("uses 1st ordinal for age 1", () => {
      renderReview({ EventType: "Birthday Party", ChildAge: "1" });
      expect(screen.getByRole("heading", { name: /1st/ })).toBeInTheDocument();
    });

    it("uses 2nd ordinal for age 2", () => {
      renderReview({ EventType: "Birthday Party", ChildAge: "2" });
      expect(screen.getByRole("heading", { name: /2nd/ })).toBeInTheDocument();
    });

    it("uses 3rd ordinal for age 3", () => {
      renderReview({ EventType: "Birthday Party", ChildAge: "3" });
      expect(screen.getByRole("heading", { name: /3rd/ })).toBeInTheDocument();
    });

    it("uses th ordinal for age 11 (11th, not 11st)", () => {
      renderReview({ EventType: "Birthday Party", ChildAge: "11" });
      expect(screen.getByRole("heading", { name: /11th/ })).toBeInTheDocument();
    });

    it("uses th ordinal for age 12 (12th, not 12nd)", () => {
      renderReview({ EventType: "Birthday Party", ChildAge: "12" });
      expect(screen.getByRole("heading", { name: /12th/ })).toBeInTheDocument();
    });

    it("uses th ordinal for age 13 (13th, not 13rd)", () => {
      renderReview({ EventType: "Birthday Party", ChildAge: "13" });
      expect(screen.getByRole("heading", { name: /13th/ })).toBeInTheDocument();
    });
  });

  describe("non-Birthday Party (Public / Charity) rendering", () => {
    it("shows organization name in event header", () => {
      renderReview({
        EventType: "Public Event",
        OrganizationName: "Springfield Library",
        ChildName: undefined,
        ChildAge: undefined,
      });
      expect(
        screen.getByRole("heading", { level: 3, name: /Springfield Library/ })
      ).toBeInTheDocument();
    });
  });

  describe("TOS checkbox", () => {
    it("renders an unchecked checkbox by default", () => {
      renderReview();
      const checkbox = screen.getByRole("checkbox", {
        name: /terms of service/i,
      });
      expect(checkbox).not.toBeChecked();
    });

    it("shows a validation error when TOS is not checked and validation fires", async () => {
      renderReview({ AgreeToTOS: false });
      await triggerValidation();
      await waitFor(() => {
        expect(
          screen.getByText(/you must agree to the terms of service/i)
        ).toBeInTheDocument();
      });
    });

    it("becomes checked when clicked", () => {
      renderReview();
      const checkbox = screen.getByRole("checkbox", {
        name: /terms of service/i,
      });
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it("clears the TOS error once the checkbox is checked", async () => {
      renderReview({ AgreeToTOS: false });
      await triggerValidation();
      await waitFor(() =>
        screen.getByText(/you must agree to the terms of service/i)
      );

      fireEvent.click(
        screen.getByRole("checkbox", { name: /terms of service/i })
      );

      await waitFor(() => {
        expect(
          screen.queryByText(/you must agree to the terms of service/i)
        ).not.toBeInTheDocument();
      });
    });

    it("renders a link to the Terms of Service page", () => {
      renderReview();
      const link = screen.getByRole("link", { name: /terms of service/i });
      expect(link).toHaveAttribute("href", "/tos");
    });
  });
});
