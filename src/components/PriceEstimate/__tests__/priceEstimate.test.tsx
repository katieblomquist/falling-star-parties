/**
 * priceEstimate.test.tsx
 *
 * Tests for the PriceEstimate sidebar component.
 */

/* eslint-disable react/display-name */

import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { useForm } from "react-hook-form";
import type { FormValues } from "@/app/book/BookClient";
import { DateTime } from "luxon";

// Mock icons
jest.mock("@tabler/icons-react", () => ({
  IconChevronDown: () => <span data-testid="chevron-down" />,
  IconChevronUp: () => <span data-testid="chevron-up" />,
}));

// ---------------------------------------------------------------------------
// Wrapper — provides a react-hook-form control with preset values
// ---------------------------------------------------------------------------

function Wrapper({ defaultValues }: { defaultValues?: Partial<FormValues> }) {
  const { control } = useForm<FormValues>({
    defaultValues: {
      EventType: "Birthday Party",
      Package: 0, // Dream — cost: 200, additionalCharacterCost: 100
      Extras: [],
      NumCharacters: "1",
      Attendance: "10",
      ...defaultValues,
    } as Partial<FormValues>,
  });

  const PriceEstimate = require("../priceEstimate").default;
  return <PriceEstimate controller={control} />;
}

// ---------------------------------------------------------------------------
// Mock fetch for travel fee
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ fee: 0, miles: 10, tolls: false }),
  }) as jest.Mock;

  // Default: desktop layout
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: 1200,
  });
  window.dispatchEvent(new Event("resize"));
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("PriceEstimate", () => {
  describe("desktop layout (width > 1100)", () => {
    it("renders the estimate panel", () => {
      render(<Wrapper />);
      expect(screen.getByText(/your estimate/i)).toBeInTheDocument();
    });

    it("shows base visit cost when a package is selected", () => {
      render(<Wrapper defaultValues={{ EventType: "Birthday Party", Package: 0 }} />);
      // Dream package costs $200 — appears in both the base visit line and the total line
      const matches = screen.getAllByText("$200");
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });

    it("shows total line", () => {
      render(<Wrapper />);
      expect(screen.getByText(/total/i)).toBeInTheDocument();
    });

    it("shows the disclaimer text", () => {
      render(<Wrapper />);
      expect(screen.getByText(/estimates may not be exact/i)).toBeInTheDocument();
    });
  });

  describe("mobile layout (width <= 1100)", () => {
    beforeEach(() => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 800,
      });
      window.dispatchEvent(new Event("resize"));
    });

    it("renders the mobile header bar", async () => {
      render(<Wrapper />);
      await waitFor(() => {
        expect(screen.getByText(/your estimate/i)).toBeInTheDocument();
      });
    });

    it("shows chevron-up icon when popup is closed", async () => {
      render(<Wrapper />);
      await waitFor(() => {
        expect(screen.getByTestId("chevron-up")).toBeInTheDocument();
      });
    });
  });

  describe("fee calculations", () => {
    it("shows additional character cost when more than 1 character", () => {
      // Dream package: additionalCharacterCost = 100, 2 characters → $100 extra
      render(
        <Wrapper
          defaultValues={{
            EventType: "Birthday Party",
            Package: 0,
            NumCharacters: "2",
          }}
        />
      );
      // The additional characters line should show $100
      expect(screen.getByText("$100")).toBeInTheDocument();
    });

    it("does not show additional character line for 1 character", () => {
      render(
        <Wrapper
          defaultValues={{
            EventType: "Birthday Party",
            Package: 0,
            NumCharacters: "1",
          }}
        />
      );
      expect(screen.queryByText(/additional characters/i)).not.toBeInTheDocument();
    });

    it("shows travel fee line when travel cost is non-zero", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ fee: 25, miles: 40, tolls: false }),
      });

      render(
        <Wrapper
          defaultValues={{
            EventType: "Birthday Party",
            Package: 0,
            LocationLat: 38.9,
            LocationLng: -77.0,
          }}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/travel fee/i)).toBeInTheDocument();
      });
    });

    it("does not show travel fee line when fee is 0", async () => {
      render(
        <Wrapper
          defaultValues={{
            EventType: "Birthday Party",
            Package: 0,
            LocationLat: 38.9,
            LocationLng: -77.0,
          }}
        />
      );

      // Give the fetch a moment to resolve
      await waitFor(() => {
        expect(screen.queryByText(/travel fee/i)).not.toBeInTheDocument();
      });
    });

    it("shows extras cost for Birthday Party extras", () => {
      // id:0 = Storybook Keepsake, cost $20
      render(
        <Wrapper
          defaultValues={{
            EventType: "Birthday Party",
            Package: 0,
            Extras: [0],
          }}
        />
      );
      expect(screen.getByText(/storybook keepsake/i)).toBeInTheDocument();
      expect(screen.getByText("$20")).toBeInTheDocument();
    });

    it("calculates gift bag cost based on guest count", () => {
      // id:3 = Gift Bags, cost $10/child, 5 guests → $50
      render(
        <Wrapper
          defaultValues={{
            EventType: "Birthday Party",
            Package: 0,
            Extras: [3],
            Attendance: "5",
          }}
        />
      );
      expect(screen.getByText("$50")).toBeInTheDocument();
    });

    it("shows last-minute booking fee line when date is within 7 days", async () => {
      // Dream package costs $200, 30% surcharge = $60
      const tomorrow = DateTime.now().plus({ days: 1 });
      render(
        <Wrapper
          defaultValues={{
            EventType: "Birthday Party",
            Package: 0,
            Date: tomorrow,
          }}
        />
      );
      await waitFor(() => {
        expect(screen.getByText(/last-minute booking/i)).toBeInTheDocument();
        expect(screen.getByText("$60")).toBeInTheDocument();
      });
    });

    it("does not show last-minute booking fee line when date is more than 7 days away", async () => {
      const farFuture = DateTime.now().plus({ days: 30 });
      render(
        <Wrapper
          defaultValues={{
            EventType: "Birthday Party",
            Package: 0,
            Date: farFuture,
          }}
        />
      );
      await waitFor(() => {
        expect(screen.queryByText(/last-minute booking/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("travel fee fetching", () => {
    it("fetches travel fee when lat/lng are set", async () => {
      render(
        <Wrapper
          defaultValues={{
            EventType: "Birthday Party",
            Package: 0,
            LocationLat: 38.9,
            LocationLng: -77.0,
          }}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/travelfee?lat=38.9&lng=-77")
        );
      });
    });

    it("does not fetch travel fee when lat/lng are not set", async () => {
      render(
        <Wrapper
          defaultValues={{
            EventType: "Birthday Party",
            Package: 0,
          }}
        />
      );

      // Small wait to ensure no fetch was queued
      await new Promise((r) => setTimeout(r, 50));
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
