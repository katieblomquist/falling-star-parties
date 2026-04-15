/**
 * timeLocation.test.tsx
 *
 * Tests for the TimeLocation booking form step.
 * PlacesAutocomplete is mocked (it loads Google Maps at runtime).
 */

/* eslint-disable react/display-name */

import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useForm, FormProvider } from "react-hook-form";
import type { FormValues } from "@/app/book/BookClient";

// Mock child components with heavy dependencies
jest.mock("@/components/form/DateSelector/dateSelector", () =>
  ({ selectDate }: { selectDate: (v: unknown) => void }) => (
    <button data-testid="date-selector" onClick={() => selectDate({})} type="button">
      Select Date
    </button>
  )
);

jest.mock("@/components/form/Dropdown/dropdown", () =>
  ({ setData, options }: { setData: (v: string) => void; options: string[] }) => (
    <select
      data-testid="time-dropdown"
      onChange={(e) => setData(e.target.value)}
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  )
);

// Mock PlacesAutocomplete — capture the onPlaceSelected callback so tests can
// trigger it
let capturedOnPlaceSelected: ((location: unknown, components: unknown) => void) | null = null;

jest.mock(
  "@/components/form/Places Autocomplete/placesAutocoomplet",
  () => ({
    __esModule: true,
    default: ({ onPlaceSelected, invalid }: {
      onPlaceSelected: (l: unknown, c: unknown) => void;
      invalid?: boolean;
    }) => {
      capturedOnPlaceSelected = onPlaceSelected;
      return (
        <input
          data-testid="places-autocomplete"
          aria-invalid={invalid}
          placeholder="Enter event address"
          readOnly
        />
      );
    },
  })
);

import TimeLocation from "../timeLocation";

// ---------------------------------------------------------------------------
// Wrapper that provides react-hook-form context
// ---------------------------------------------------------------------------

function Wrapper() {
  const methods = useForm<FormValues>({
    defaultValues: {
      StreetAddress: "",
      City: "",
      State: "",
      Zip: "",
    },
  });

  return (
    <FormProvider {...methods}>
      <TimeLocation controller={methods.control} errors={methods.formState.errors} />
      {/* Expose hidden field values for test assertions */}
      <div data-testid="street-value">{methods.watch("StreetAddress")}</div>
      <div data-testid="city-value">{methods.watch("City")}</div>
      <div data-testid="state-value">{methods.watch("State")}</div>
      <div data-testid="zip-value">{methods.watch("Zip")}</div>
      <div data-testid="lat-value">{String(methods.watch("LocationLat") ?? "")}</div>
      <div data-testid="lng-value">{String(methods.watch("LocationLng") ?? "")}</div>
    </FormProvider>
  );
}

beforeEach(() => {
  capturedOnPlaceSelected = null;
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("TimeLocation", () => {
  describe("rendering", () => {
    it("renders the date selector", () => {
      render(<Wrapper />);
      expect(screen.getByTestId("date-selector")).toBeInTheDocument();
    });

    it("renders the time dropdown", () => {
      render(<Wrapper />);
      expect(screen.getByTestId("time-dropdown")).toBeInTheDocument();
    });

    it("renders the places autocomplete input", () => {
      render(<Wrapper />);
      expect(screen.getByTestId("places-autocomplete")).toBeInTheDocument();
    });

    it("does NOT render manual Street Address / City / State / Zip inputs", () => {
      render(<Wrapper />);
      expect(screen.queryByLabelText(/street address/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/city/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/state/i)).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText(/zip/i)).not.toBeInTheDocument();
    });
  });

  describe("address autocomplete", () => {
    it("populates StreetAddress when a place is selected", async () => {
      render(<Wrapper />);
      expect(capturedOnPlaceSelected).not.toBeNull();

      await act(async () => {
        capturedOnPlaceSelected!(
          { address: "123 Main St, Springfield, VA 22150", lat: 38.9, lng: -77.0 },
          { streetNumber: "123", route: "Main St", city: "Springfield", state: "VA", zip: "22150", formattedAddress: "123 Main St, Springfield, VA 22150" }
        );
      });

      expect(screen.getByTestId("street-value").textContent).toBe("123 Main St");
    });

    it("populates City when a place is selected", async () => {
      render(<Wrapper />);
      await act(async () => {
        capturedOnPlaceSelected!(
          { address: "123 Main St, Springfield, VA 22150", lat: 38.9, lng: -77.0 },
          { streetNumber: "123", route: "Main St", city: "Springfield", state: "VA", zip: "22150", formattedAddress: "123 Main St, Springfield, VA 22150" }
        );
      });
      expect(screen.getByTestId("city-value").textContent).toBe("Springfield");
    });

    it("populates State when a place is selected", async () => {
      render(<Wrapper />);
      await act(async () => {
        capturedOnPlaceSelected!(
          { address: "123 Main St, Springfield, VA 22150", lat: 38.9, lng: -77.0 },
          { streetNumber: "123", route: "Main St", city: "Springfield", state: "VA", zip: "22150", formattedAddress: "123 Main St, Springfield, VA 22150" }
        );
      });
      expect(screen.getByTestId("state-value").textContent).toBe("VA");
    });

    it("populates Zip when a place is selected", async () => {
      render(<Wrapper />);
      await act(async () => {
        capturedOnPlaceSelected!(
          { address: "123 Main St, Springfield, VA 22150", lat: 38.9, lng: -77.0 },
          { streetNumber: "123", route: "Main St", city: "Springfield", state: "VA", zip: "22150", formattedAddress: "123 Main St, Springfield, VA 22150" }
        );
      });
      expect(screen.getByTestId("zip-value").textContent).toBe("22150");
    });

    it("stores LocationLat when a place is selected", async () => {
      render(<Wrapper />);
      await act(async () => {
        capturedOnPlaceSelected!(
          { address: "123 Main St, Springfield, VA 22150", lat: 38.9, lng: -77.0 },
          { streetNumber: "123", route: "Main St", city: "Springfield", state: "VA", zip: "22150", formattedAddress: "123 Main St, Springfield, VA 22150" }
        );
      });
      expect(screen.getByTestId("lat-value").textContent).toBe("38.9");
    });

    it("stores LocationLng when a place is selected", async () => {
      render(<Wrapper />);
      await act(async () => {
        capturedOnPlaceSelected!(
          { address: "123 Main St, Springfield, VA 22150", lat: 38.9, lng: -77.0 },
          { streetNumber: "123", route: "Main St", city: "Springfield", state: "VA", zip: "22150", formattedAddress: "123 Main St, Springfield, VA 22150" }
        );
      });
      expect(screen.getByTestId("lng-value").textContent).toBe("-77");
    });

    it("falls back to full formatted address for StreetAddress when streetNumber/route are empty", async () => {
      render(<Wrapper />);
      await act(async () => {
        capturedOnPlaceSelected!(
          { address: "Springfield Community Center, VA", lat: 38.9, lng: -77.0 },
          { streetNumber: "", route: "", city: "Springfield", state: "VA", zip: "22150", formattedAddress: "Springfield Community Center, VA" }
        );
      });
      expect(screen.getByTestId("street-value").textContent).toBe("Springfield Community Center, VA");
    });
  });
});
